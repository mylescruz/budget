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
          category: 1,
          fromAccount: 1,
          toAccount: 1,
          description: 1,
          amount: { $divide: ["$amount", 100] },
        },
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
    // Format each transaction based on its type
    const newTransactions = [...req.body].map((transaction) => {
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
        newTransaction.category = transaction.category;
      } else if (transactionType === "Transfer") {
        newTransaction.fromAccount = transaction.fromAccount;
        newTransaction.toAccount = transaction.toAccount;
        newTransaction.description = transaction.description;
      } else {
        return res
          .status(500)
          .send(`${transactionType} is an invalid transaction type`);
      }

      return newTransaction;
    });

    let insertedIds;

    // Start a MongoDB transaction
    await mongoSession.withTransaction(async (session) => {
      // Insert all the transactions into MongoDB
      insertedIds = await transactionsCol.insertMany(newTransactions, {
        session,
      });

      // Update the correlating category's actual value for all expense transactions
      for (const transaction of newTransactions) {
        if (transaction.type === "Expense") {
          // Find the matching category or subcategory
          const category = await categoriesCol.findOne(
            {
              username,
              month,
              year,
              $or: [
                { name: transaction.category },
                { "subcategories.name": transaction.category },
              ],
            },
            { session },
          );

          if (category) {
            if (category.name === transaction.category) {
              // Increment the actual value of the category
              await categoriesCol.updateOne(
                { _id: new ObjectId(category._id) },
                {
                  $inc: {
                    actual: transaction.amount,
                  },
                },
                { session },
              );
            } else {
              // Increment the actual value of the category and subcategory
              await categoriesCol.updateOne(
                {
                  _id: new ObjectId(category._id),
                  "subcategories.name": transaction.category,
                },
                {
                  $inc: {
                    actual: transaction.amount,
                    "subcategories.$.actual": transaction.amount,
                  },
                },
                { session },
              );
            }
          } else {
            throw new Error(`Category, ${transaction.category} not found`);
          }
        }
      }
    });

    // Send the new transactions back to the client with their inserted MongoDB _id and the formatted dollar amount
    const insertedTransactions = newTransactions.map((transaction, index) => {
      return {
        ...transaction,
        _id: insertedIds.insertedIds[index],
        amount: centsToDollars(transaction.amount),
      };
    });

    return res.status(200).json(insertedTransactions);
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
