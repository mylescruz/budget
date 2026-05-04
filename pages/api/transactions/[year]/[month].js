// API Endpoint for a user's transactions data

import centsToDollars from "@/helpers/centsToDollars";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";
import { logError } from "@/lib/logError";
import clientPromise from "@/lib/mongodb";
import { updateFunMoney } from "@/lib/updateFunMoney";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  // Object with parameters used in HTTP methods
  const transactionsContext = {
    client: client,
    transactionsCol: db.collection("transactions"),
    categoriesCol: db.collection("categories"),
    username: session.user.username,
    month: parseInt(req.query.month),
    year: parseInt(req.query.year),
  };

  switch (req.method) {
    case "GET":
      return getTransactions(req, res, transactionsContext);
    case "POST":
      return addTransactions(req, res, transactionsContext);
    default:
      return res.status(405).send(`${req.method} method not allowed`);
  }
}

// Get the user's transactions in MongoDB
async function getTransactions(
  req,
  res,
  { client, transactionsCol, categoriesCol, username, month, year },
) {
  const mongoSession = client.startSession();

  let transactions;

  try {
    await mongoSession.withTransaction(async (session) => {
      // Make sure a user's fixed category transactions exist for the given month first
      await ensureFixedTransactionsExist({
        username,
        month,
        year,
        transactionsCol,
        categoriesCol,
        session,
      });

      transactions = await transactionsCol
        .aggregate(
          [
            {
              $match: {
                username,
                month,
                year,
              },
            },
            {
              $project: {
                type: 1,
                date: 1,
                store: 1,
                items: 1,
                categoryId: 1,
                fromAccount: 1,
                toAccount: 1,
                source: 1,
                incomeType: 1,
                description: 1,
                amount: { $divide: ["$amount", 100] },
                createdTS: 1,
                updatedTS: 1,
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "transactionCategory",
              },
            },
            {
              $addFields: {
                category: { $arrayElemAt: ["$transactionCategory.name", 0] },
                color: { $arrayElemAt: ["$transactionCategory.color", 0] },
                fixed: { $arrayElemAt: ["$transactionCategory.fixed", 0] },
                parentCategoryId: {
                  $arrayElemAt: ["$transactionCategory.parentCategoryId", 0],
                },
              },
            },
            {
              $project: { transactionCategory: 0 },
            },
            { $sort: { date: 1, createdTS: 1 } },
          ],
          { session, maxTimeMS: 10000 },
        )
        .toArray();
    });

    // Send the transactions array back to the client
    return res.status(200).json(transactions);
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to load your transactions at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}

// Add the user's transaction to MongoDB
async function addTransactions(
  req,
  res,
  { client, transactionsCol, categoriesCol, username, month, year },
) {
  const mongoSession = client.startSession();

  try {
    const transactions = [...req.body];

    let addedTransactions;

    // Start a MongoDB transaction
    await mongoSession.withTransaction(async (session) => {
      const formattedTransactions = [];

      // Format each transaction based on its type
      for (const transaction of transactions) {
        const transactionType = transaction.type;

        const transactionDate = new Date(transaction.date);

        const newTransaction = {
          username,
          month,
          year,
          type: transactionType,
          date: transactionDate,
          amount: Number(transaction.amount) * 100,
          createdTS: new Date(),
        };

        // Define the transaction body based on the transaction type
        if (transactionType === TRANSACTION_TYPES.EXPENSE) {
          newTransaction.store = transaction.store.trim();
          newTransaction.items = transaction.items.trim();

          // Get the correlating category's _id to add to the transaction
          const transactionCategory = await categoriesCol.findOne(
            {
              username,
              month,
              year,
              name: transaction.category,
            },
            { session, maxTimeMS: 5000 },
          );

          if (!transactionCategory) {
            return res
              .status(500)
              .send(
                `${newTransaction.category} is not a category in your budget.`,
              );
          }

          // Update the transaction with the proper categoryId and name
          newTransaction.categoryId = transactionCategory._id;
          newTransaction.category = transactionCategory.name;
          newTransaction.color = transactionCategory.color;
          transaction.fixed = transactionCategory.fixed;

          if (transactionCategory.parentCategoryId) {
            transaction.parentCategoryId = transactionCategory.parentCategoryId;
          }
        } else if (transactionType === TRANSACTION_TYPES.TRANSFER) {
          newTransaction.fromAccount = transaction.fromAccount;
          newTransaction.toAccount = transaction.toAccount;
          newTransaction.description = transaction.description;
        } else {
          return res
            .status(500)
            .send(`${transactionType} is an invalid transaction type`);
        }

        formattedTransactions.push(newTransaction);
      }

      // Insert all the transactions into MongoDB
      const insertedTransactions = await transactionsCol.insertMany(
        formattedTransactions,
        {
          session,
          maxTimeMS: 5000,
        },
      );

      // Update the current month's Fun Money budget if any transfers occur
      if (
        formattedTransactions.some(
          (transaction) => transaction.type === TRANSACTION_TYPES.TRANSFER,
        )
      ) {
        await updateFunMoney({ username, month, year, session });
      }

      // Send the new transactions back to the client with their inserted MongoDB _id and the formatted dollar amount
      addedTransactions = formattedTransactions.map((transaction, index) => {
        return {
          ...transaction,
          _id: insertedTransactions.insertedIds[index],
          amount: centsToDollars(transaction.amount),
        };
      });
    });

    return res.status(200).json(addedTransactions);
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to add this new transaction at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}

// Checks if a user's fixed category's transactions exist and if not, adds them to the database
async function ensureFixedTransactionsExist({
  username,
  month,
  year,
  transactionsCol,
  categoriesCol,
  session,
}) {
  // Check if a user's fixed category transactions exist
  const transactionDocs = await transactionsCol.countDocuments(
    { username, month, year, fixed: true },
    { session, maxTimeMS: 5000 },
  );

  if (transactionDocs === 0) {
    // Creates the fixed transactions for the given month if they don't currently exist
    const fixedCategories = await categoriesCol
      .find(
        { username, month, year, fixed: true, dueDate: { $ne: null } },
        { session, maxTimeMS: 5000 },
      )
      .toArray();

    // Array to store the fixed category and subcategory expense transactions
    const fixedTransactions = [];

    // If a category or subcategory has a due date, create a transaction for the category
    fixedCategories.forEach((category) => {
      const date = new Date(year, month - 1, category.dueDate);

      const currentTS = new Date();

      const newTransaction = {
        username: username,
        month: month,
        year: year,
        type: TRANSACTION_TYPES.EXPENSE,
        date: date,
        fixed: true,
        store: category.name,
        items: `Fixed expense occuring ${category.frequency.toLowerCase()}`,
        categoryId: category._id,
        amount: category.budget,
        createdTS: currentTS,
        updatedTS: currentTS,
      };

      // Add the parent category's _id for easier querying
      if (category.parentCategoryId) {
        newTransaction.parentCategoryId = category.parentCategoryId;
      }

      fixedTransactions.push(newTransaction);
    });

    // Insert the fixed transactions for the month
    await transactionsCol.insertMany(fixedTransactions, {
      session,
      maxTimeMS: 5000,
    });
  }
}
