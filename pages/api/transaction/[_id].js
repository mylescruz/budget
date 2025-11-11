// API Endpoint for a user's transaction data

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
  const transactionContext = {
    client: client,
    transactionsCol: db.collection("transactions"),
    categoriesCol: db.collection("categories"),
    username: session.user.username,
  };

  switch (req.method) {
    case "PUT":
      return updateTransaction(req, res, transactionContext);
    case "DELETE":
      return deleteTransaction(req, res, transactionContext);
    default:
      return res.status(405).send(`${req.method} method not allowed`);
  }
}

async function updateTransaction(
  req,
  res,
  { client, transactionsCol, categoriesCol, username }
) {
  const mongoSession = client.startSession();

  try {
    const transactionId = req.query._id;
    const transaction = {
      ...req.body,
      amount: req.body.amount * 100,
      oldAmount: req.body.oldAmount,
    };

    // Get the month and date for the given transaction
    const transactionDate = new Date(transaction.date);
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async () => {
      // Update the transaction with the new values in MongoDB
      await transactionsCol.updateOne(
        {
          _id: new ObjectId(transactionId),
        },
        {
          $set: {
            date: transaction.date,
            store: transaction.store,
            items: transaction.items,
            category: transaction.category,
            amount: transaction.amount,
          },
        },
        { session: mongoSession }
      );

      // Update the old category
      await updateCategoryActual(
        mongoSession,
        categoriesCol,
        username,
        month,
        year,
        transaction.oldCategory,
        -transaction.oldAmount
      );

      // Update the new category
      await updateCategoryActual(
        mongoSession,
        categoriesCol,
        username,
        month,
        year,
        transaction.category,
        transaction.amount
      );
    });

    const { oldCategory, oldAmount, ...updatedTransaction } = transaction;

    // Send the updated transaction back to the client
    return res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error(`PUT transaction request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while editting a transaction for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}

async function deleteTransaction(
  req,
  res,
  { client, transactionsCol, categoriesCol, username }
) {
  const mongoSession = client.startSession();

  try {
    const transactionId = req.query._id;
    const transaction = req.body;

    // Get the month and date for the given transaction
    const transactionDate = new Date(transaction.date);
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async () => {
      // Delete the given transaction from the transactions collection in MongoDB
      await transactionsCol.deleteOne(
        { _id: new ObjectId(transactionId) },
        { session: mongoSession }
      );

      // Update the correlating category to remove old transaction amount
      await updateCategoryActual(
        mongoSession,
        categoriesCol,
        username,
        month,
        year,
        transaction.category,
        -transaction.amount
      );
    });

    // Send a success message back to the client
    return res
      .status(200)
      .json({ _id: transactionId, message: "Transaction was deleted" });
  } catch (error) {
    console.error(
      `DELETE transaction request failed for ${username}: ${error}`
    );
    return res
      .status(500)
      .send(`Error occurred while deleting a transaction for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}

// Update the given category or subcategory's actual value
async function updateCategoryActual(
  mongoSession,
  categoriesCol,
  username,
  month,
  year,
  categoryName,
  amount
) {
  const category = await categoriesCol.findOne(
    {
      username,
      month,
      year,
      $or: [{ name: categoryName }, { "subcategories.name": categoryName }],
    },
    { session: mongoSession }
  );

  if (!category) {
    throw new Error(`Category ${categoryName} was not found`);
  }

  // Check if the category is a parent or subcategory
  if (category.name === categoryName) {
    // Update parent category
    await categoriesCol.updateOne(
      { _id: new ObjectId(category._id) },
      { $inc: { actual: amount } },
      { session: mongoSession }
    );
  } else {
    // Update parent category and subcategory
    await categoriesCol.updateOne(
      { _id: new ObjectId(category._id), "subcategories.name": categoryName },
      { $inc: { actual: amount, "subcategories.$.actual": amount } },
      { session: mongoSession }
    );
  }
}
