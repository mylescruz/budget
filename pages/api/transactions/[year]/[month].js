// API Endpoint for a user's transactions data

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

  const username = session.user.username;

  const month = parseInt(req?.query?.month);
  const year = parseInt(req?.query?.year);
  const method = req?.method;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const transactionsCol = db.collection("transactions");
  const categoriesCol = db.collection("categories");
  const paychecksCol = db.collection("paychecks");
  const historyCol = db.collection("history");

  // Get the transactions from MongoDB and return the necessary fields
  const getTransactions = async () => {
    const docs = await transactionsCol
      .find({ username: username, month: month, year: year })
      .sort({ date: 1 })
      .toArray();

    const transactions = docs.map((transaction) => {
      return {
        id: transaction._id,
        date: transaction.date,
        store: transaction.store,
        items: transaction.items,
        category: transaction.category,
        amount: transaction.amount,
      };
    });

    return transactions;
  };

  // Function to update the given transactions' category in MongoDB
  const updateTransaction = async (changedTransactions) => {
    let numUpdated = 0;

    for (const transaction of changedTransactions) {
      const result = await transactionsCol.updateOne(
        { _id: new ObjectId(transaction.id) },
        { $set: { category: transaction.category } }
      );

      if (result.modifiedCount === 1) {
        numUpdated++;
      }
    }

    return numUpdated === changedTransactions.length;
  };

  if (method === "GET") {
    try {
      const transactions = await getTransactions();

      // Send the transactions array back to the client
      res.status(200).json(transactions);
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res
        .status(500)
        .send(`Error occurred while getting ${username}'s transactions`);
    }
  } else if (method === "POST") {
    try {
      const transactionBody = req?.body;

      // Assign an id to the new transaction
      const newTransaction = {
        ...transactionBody,
        amount: transactionBody.amount * 100,
        username: username,
        month: month,
        year: year,
      };

      // Add the new transaction to the transactions collection in MongoDB
      const result = await transactionsCol.insertOne(newTransaction);

      if (result.acknowledged) {
        // Update the corresponding category in the categories collection
        const categoriesCol = db.collection("categories");

        // Find the matching category or subcategory
        const category = await categoriesCol.findOne({
          username: username,
          month: month,
          year: year,
          $or: [
            { name: newTransaction.category },
            { "subcategories.name": newTransaction.category },
          ],
        });

        // Update the corresponding category's actual amount
        if (category.name === newTransaction.category) {
          // Increment the actual value of the category
          const result = await categoriesCol.updateOne(
            { _id: new ObjectId(category._id) },
            {
              $inc: {
                actual: newTransaction.amount,
              },
            }
          );
        } else {
          // Increment the actual value of the category and subcategory
          const result = await categoriesCol.updateOne(
            {
              _id: new ObjectId(category._id),
              "subcategories.name": newTransaction.category,
            },
            {
              $inc: {
                actual: newTransaction.amount,
                "subcategories.$.actual": newTransaction.amount,
              },
            }
          );
        }

        // Add the transactions amount to the history's actual amount for the month of the transaction
        const transactionDate = new Date(newTransaction.date);
        const monthName = transactionDate.toLocaleDateString("en-US", {
          month: "long",
        });

        // Get the total net income for the old month
        const paychecks = await paychecksCol
          .find({ username: username, month: month, year: year })
          .toArray();
        const updatedBudget = paychecks.reduce(
          (sum, current) => sum + current.net,
          0
        );

        // Get the total actual value for all categories
        const categories = await categoriesCol
          .find({
            username: username,
            month: month,
            year: year,
          })
          .toArray();
        const updatedActual = categories.reduce(
          (sum, current) => sum + current.actual,
          0
        );

        const updatedLeftover = updatedBudget - updatedActual;

        // Update the history month
        await historyCol.updateOne(
          { username: username, month: month, year: year },
          {
            $set: {
              monthName: monthName,
              month: month,
              year: year,
              budget: updatedBudget,
              actual: updatedActual,
              leftover: updatedLeftover,
            },
          }
        );
      }

      // Send the new transaction back to the client
      res.status(200).json({ id: result.insertedId, ...newTransaction });
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res.status(500).send("Error occurred while adding a transaction");
    }
  } else if (method === "PUT") {
    try {
      const changedTransactions = req?.body;

      const results = await updateTransaction(changedTransactions);

      if (results) {
        // Send the updated transactions back to the client
        const transactions = await getTransactions();

        res.status(200).json(transactions);
      } else {
        throw new Error("Categories could not be updated");
      }
    } catch (error) {
      if (error.message === "Transactions were not found") {
        res.status(404).send(error.message);
      } else {
        console.error(`${method} transactions request failed: ${error}`);
        res
          .status(500)
          .send("Error occurred while updating changed transactions");
      }
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
