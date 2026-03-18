// API Endpoint for a user's transaction data

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
  { client, transactionsCol, categoriesCol, username },
) {
  const mongoSession = client.startSession();

  try {
    const transactionId = req.query._id;

    // Get the month and date for the given transaction
    const transactionDate = new Date(`${req.body.date}T00:00:00Z`);
    const month = transactionDate.getUTCMonth() + 1;
    const year = transactionDate.getFullYear();

    // Define the updated transaction based on its type
    const transaction = {
      _id: transactionId,
      type: req.body.type,
      date: req.body.date,
      amount: parseFloat(req.body.amount) * 100,
    };

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      if (transaction.type === "Expense") {
        transaction.store = req.body.store;
        transaction.items = req.body.items;

        // Get the correlating category's _id to add to the transaction
        const transactionCategory = await categoriesCol.findOne(
          {
            username,
            month,
            year,
            name: req.body.category,
          },
          { session },
        );

        if (!transactionCategory) {
          return res
            .status(500)
            .send(`${req.body.category} is not a category in your budget.`);
        }

        transaction.categoryId = transactionCategory._id;
        transaction.category = transactionCategory.name;
        transaction.color = transactionCategory.color;
        transaction.fixed = transactionCategory.fixed;
        transaction.parentCategoryId = transactionCategory.parentCategoryId;
      } else if (transaction.type === "Transfer") {
        transaction.fromAccount = req.body.fromAccount;
        transaction.toAccount = req.body.toAccount;
        transaction.description = req.body.description;
      } else {
        return res
          .status(500)
          .send(`${transaction.type} is not a valid transaction type`);
      }

      // Update an expense transaction and the correlating category's actual values
      if (transaction.type === "Expense") {
        await transactionsCol.updateOne(
          {
            _id: new ObjectId(transactionId),
          },
          {
            $set: {
              date: transaction.date,
              store: transaction.store.trim(),
              items: transaction.items.trim(),
              categoryId: transaction.categoryId,
              amount: transaction.amount,
            },
          },
          { session },
        );
      }

      // Update a transfer transaction
      if (transaction.type === "Transfer") {
        await transactionsCol.updateOne(
          {
            _id: new ObjectId(transactionId),
          },
          {
            $set: {
              date: transaction.date,
              fromAccount: transaction.fromAccount,
              toAccount: transaction.toAccount,
              description: transaction.description.trim(),
              amount: transaction.amount,
            },
          },
          { session },
        );
      }
    });

    // Send the updated transaction back to the client
    const updatedTransaction = {
      ...transaction,
      amount: centsToDollars(transaction.amount),
    };

    return res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error(`PUT transaction request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while editing a transaction for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}

async function deleteTransaction(
  req,
  res,
  { client, transactionsCol, categoriesCol, username },
) {
  const mongoSession = client.startSession();

  try {
    const transactionId = req.query._id;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      const transaction = await transactionsCol.findOne({
        _id: new ObjectId(transactionId),
      });

      // Delete the given transaction from the transactions collection in MongoDB
      await transactionsCol.deleteOne(
        { _id: new ObjectId(transactionId) },
        { session },
      );

      if (transaction.type === "Expense") {
        // Update the correlating category to remove old transaction amount
        await updateCategoryActual({
          session,
          categoriesCol,
          username,
          month: transaction.month,
          year: transaction.year,
          categoryName: transaction.category,
          amount: -transaction.amount,
        });
      }
    });

    // Send a success message back to the client
    return res.status(200).send("Transaction was deleted successfully");
  } catch (error) {
    console.error(
      `DELETE transaction request failed for ${username}: ${error}`,
    );
    return res
      .status(500)
      .send(`Error occurred while deleting a transaction for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}

// Update the given category or subcategory's actual value
async function updateCategoryActual({
  session,
  categoriesCol,
  username,
  month,
  year,
  categoryName,
  amount,
}) {
  const category = await categoriesCol.findOne(
    {
      username,
      month,
      year,
      $or: [{ name: categoryName }, { "subcategories.name": categoryName }],
    },
    { session },
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
      { session },
    );
  } else {
    // Update parent category and subcategory
    await categoriesCol.updateOne(
      { _id: new ObjectId(category._id), "subcategories.name": categoryName },
      { $inc: { actual: amount, "subcategories.$.actual": amount } },
      { session },
    );
  }
}
