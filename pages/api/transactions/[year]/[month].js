// API Endpoint for a user's transactions data

import centsToDollars from "@/helpers/centsToDollars";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { ObjectId } from "mongodb";
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
      return getTransactions(res, transactionsContext);
    case "POST":
      return addTransactions(req, res, transactionsContext);
    case "PUT":
      return updateTransactions(req, res, transactionsContext);
    default:
      return res.status(405).send(`${req.method} method not allowed`);
  }
}

// Fetch the user's transactions for the given month and year
async function fetchTransactions(transactionsCol, username, month, year) {
  return await transactionsCol
    .aggregate([
      { $match: { username, month, year } },
      {
        $project: {
          type: 1,
          date: 1,
          store: 1,
          items: 1,
          categoryId: 1,
          fromAccount: 1,
          toAccount: 1,
          description: 1,
          amount: { $divide: ["$amount", 100] },
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
      { $sort: { date: 1 } },
    ])
    .toArray();
}

// Get the user's transactions in MongoDB
async function getTransactions(
  res,
  { transactionsCol, username, month, year },
) {
  try {
    const transactions = await fetchTransactions(
      transactionsCol,
      username,
      month,
      year,
    );

    // Send the transactions array back to the client
    return res.status(200).json(transactions);
  } catch (error) {
    console.error(`GET transactions request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while getting transactions for ${username}`);
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

        const newTransaction = {
          username,
          month,
          year,
          type: transactionType,
          date: transaction.date,
          amount: Number(transaction.amount) * 100,
        };

        // Define the transaction body based on the transaction type
        if (transactionType === "Expense") {
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
            { session },
          );

          if (!transactionCategory) {
            return res
              .status(500)
              .send(
                `${newTransaction.category} is not a category in your budget.`,
              );
          }

          newTransaction.category = transaction.category;
          newTransaction.categoryId = transactionCategory._id;
        } else if (transactionType === "Transfer") {
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

      let insertedTransactions;

      // Insert all the transactions into MongoDB
      insertedTransactions = await transactionsCol.insertMany(
        formattedTransactions,
        {
          session,
        },
      );

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
    console.error(`POST transactions request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while adding a transaction for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}

// Update the user's transactions category in MongoDB
async function updateTransactions(
  req,
  res,
  { transactionsCol, username, month, year },
) {
  try {
    const changedTransactions = req.body;

    const updates = changedTransactions.map((transaction) => ({
      updateOne: {
        filter: { _id: new ObjectId(transaction._id) },
        update: { $set: { category: transaction.category } },
      },
    }));

    const bulkWriteResult = await transactionsCol.bulkWrite(updates);

    if (bulkWriteResult.modifiedCount === changedTransactions.length) {
      // Send the updated transactions back to the client
      const transactions = await fetchTransactions(
        transactionsCol,
        username,
        month,
        year,
      );

      return res.status(200).json(transactions);
    } else {
      throw new Error("Categories could not be updated");
    }
  } catch (error) {
    console.error(`PUT transactions request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(
        `Error occurred while updating changed transactions for ${username}`,
      );
  }
}
