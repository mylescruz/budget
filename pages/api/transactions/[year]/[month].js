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
      return addTransaction(req, res, transactionsContext);
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
          date: 1,
          store: 1,
          items: 1,
          category: 1,
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
  { transactionsCol, username, month, year }
) {
  try {
    const transactions = await fetchTransactions(
      transactionsCol,
      username,
      month,
      year
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
async function addTransaction(
  req,
  res,
  { client, transactionsCol, categoriesCol, username, month, year }
) {
  const mongoSession = client.startSession();

  try {
    const newTransaction = {
      ...req.body,
      store: req.body.store.trim(),
      items: req.body.items.trim(),
      amount: parseFloat(req.body.amount) * 100,
      username,
      month,
      year,
    };

    let insertedId;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Add the new transaction to the transactions collection in MongoDB
      const insertedTransaction = await transactionsCol.insertOne(
        newTransaction,
        { session }
      );

      insertedId = insertedTransaction.insertedId;

      // Find the matching category or subcategory
      const category = await categoriesCol.findOne(
        {
          username,
          month,
          year,
          $or: [
            { name: newTransaction.category },
            { "subcategories.name": newTransaction.category },
          ],
        },
        { session }
      );

      if (category) {
        // Update the corresponding category's actual amount
        if (category.name === newTransaction.category) {
          // Increment the actual value of the category
          await categoriesCol.updateOne(
            { _id: new ObjectId(category._id) },
            {
              $inc: {
                actual: newTransaction.amount,
              },
            },
            { session }
          );
        } else {
          // Increment the actual value of the category and subcategory
          await categoriesCol.updateOne(
            {
              _id: new ObjectId(category._id),
              "subcategories.name": newTransaction.category,
            },
            {
              $inc: {
                actual: newTransaction.amount,
                "subcategories.$.actual": newTransaction.amount,
              },
            },
            { session }
          );
        }
      } else {
        throw new Error(`Category, ${newTransaction.category} not found`);
      }
    });

    // Send the new transaction back to the client
    const insertedTransaction = {
      ...newTransaction,
      _id: insertedId,
      amount: centsToDollars(newTransaction.amount),
    };

    return res.status(200).json(insertedTransaction);
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
  { transactionsCol, username, month, year }
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
        year
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
        `Error occurred while updating changed transactions for ${username}`
      );
  }
}
