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

  const method = req?.method;
  const id = req?.query?.id;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const transactionsCol = db.collection("transactions");
  const categoriesCol = db.collection("categories");
  const paychecksCol = db.collection("paychecks");
  const historyCol = db.collection("history");

  if (method === "GET") {
    try {
      const doc = await transactionsCol.findOne({ _id: new ObjectId(id) });

      // If a user tries to directly access a different user's data, send an error message
      if (session.user.username !== doc.username) {
        return res.status(401).send("Access denied to this user's data");
      }

      const { _id, transaction } = doc;

      // Send the transaction back to the client
      res.status(200).json({ id: _id.toString(), ...transaction });
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res
        .status(500)
        .send(`Error occurred while getting ${username}'s transactions`);
    }
  } else if (method === "PUT") {
    try {
      const edittedTransaction = req?.body;

      console.log(edittedTransaction);

      // Update the given transaction from the transactions collection in MongoDB
      const result = await transactionsCol.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            date: edittedTransaction.date,
            store: edittedTransaction.store,
            items: edittedTransaction.items,
            category: edittedTransaction.category,
            amount: edittedTransaction.amount,
          },
        }
      );

      if (result.modifiedCount === 1) {
        // Update the corresponding category in the categories collection

        // Find the new matching category or subcategory
        const newCategory = await categoriesCol.findOne({
          username: username,
          month: edittedTransaction.month,
          year: edittedTransaction.year,
          $or: [
            { name: edittedTransaction.category },
            { "subcategories.name": edittedTransaction.category },
          ],
        });

        // Update the new corresponding category's actual amount
        if (newCategory.name === edittedTransaction.category) {
          // If new category name matches the parent category

          // Update the actual value of the category
          await categoriesCol.updateOne(
            { _id: new ObjectId(newCategory._id) },
            {
              $inc: {
                actual: edittedTransaction.amount,
              },
            }
          );
        } else {
          // If new category name matches the subcategory

          // Update the actual value of the category and subcategory
          await categoriesCol.updateOne(
            {
              _id: new ObjectId(newCategory._id),
              "subcategories.name": edittedTransaction.category,
            },
            {
              $inc: {
                actual: edittedTransaction.amount,
                "subcategories.$.actual": edittedTransaction.amount,
              },
            }
          );
        }

        // Find the old matching category or subcategory
        const oldCategory = await categoriesCol.findOne({
          username: username,
          month: edittedTransaction.month,
          year: edittedTransaction.year,
          $or: [
            { name: edittedTransaction.oldCategory },
            { "subcategories.name": edittedTransaction.oldCategory },
          ],
        });

        // Update the old corresponding category's actual amount
        if (oldCategory.name === edittedTransaction.oldCategory) {
          // If old category name matches the parent category

          // Update the actual value of the category
          await categoriesCol.updateOne(
            { _id: new ObjectId(oldCategory._id) },
            {
              $inc: {
                actual: -edittedTransaction.oldAmount,
              },
            }
          );
        } else {
          // If old category name matches the subcategory

          // Update the actual value of the category and subcategory
          await categoriesCol.updateOne(
            {
              _id: new ObjectId(oldCategory._id),
              "subcategories.name": edittedTransaction.oldCategory,
            },
            {
              $inc: {
                actual: -edittedTransaction.oldAmount,
                "subcategories.$.actual": -edittedTransaction.oldAmount,
              },
            }
          );
        }

        // Update the history's actual amount for the month of the transaction
        const transactionDate = new Date(edittedTransaction.date);
        const monthName = transactionDate.toLocaleDateString("en-US", {
          month: "long",
        });

        // Get the total net income for the month
        const paychecks = await paychecksCol
          .find({
            username: username,
            month: edittedTransaction.month,
            year: edittedTransaction.year,
          })
          .toArray();
        const updatedBudget = paychecks.reduce(
          (sum, current) => sum + current.net,
          0
        );

        // Get the total actual value for all categories
        const categories = await categoriesCol
          .find({
            username: username,
            month: edittedTransaction.month,
            year: edittedTransaction.year,
          })
          .toArray();
        const updatedActual = categories.reduce(
          (sum, current) => sum + current.actual,
          0
        );

        const updatedLeftover = updatedBudget - updatedActual;

        // Update the history month
        await historyCol.updateOne(
          {
            username: username,
            month: edittedTransaction.month,
            year: edittedTransaction.year,
          },
          {
            $set: {
              monthName: monthName,
              month: edittedTransaction.month,
              year: edittedTransaction.year,
              budget: updatedBudget,
              actual: updatedActual,
              leftover: updatedLeftover,
            },
          }
        );

        // Send the editted transaction back to the client
        res.status(200).json(edittedTransaction);
      } else {
        // Send an error message back to the client
        return res.status(404).send("Transaction not found");
      }
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res.status(500).send("Error occurred while editting a transaction");
    }
  } else if (method === "DELETE") {
    try {
      const transaction = req?.body;

      // Delete the given transaction from the transactions collection in MongoDB
      const result = await transactionsCol.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 1) {
        // Update the corresponding category in the categories collection

        // Find the matching category or subcategory
        const category = await categoriesCol.findOne({
          username: username,
          month: transaction.month,
          year: transaction.year,
          $or: [
            { name: transaction.category },
            { "subcategories.name": transaction.category },
          ],
        });

        // Decrement the corresponding category's actual amount
        if (category.name === transaction.category) {
          // Decrement the actual value of the category
          await categoriesCol.updateOne(
            { _id: new ObjectId(category._id) },
            {
              $inc: {
                actual: -transaction.amount,
              },
            }
          );
        } else {
          // Decrement the actual value of the category and subcategory
          await categoriesCol.updateOne(
            {
              _id: new ObjectId(category._id),
              "subcategories.name": transaction.category,
            },
            {
              $inc: {
                actual: -transaction.amount,
                "subcategories.$.actual": -transaction.amount,
              },
            }
          );
        }

        // Update the history's actual amount for the month of the transaction
        const transactionDate = new Date(transaction.date);
        const monthName = transactionDate.toLocaleDateString("en-US", {
          month: "long",
        });

        // Get the total net income for the month
        const paychecks = await paychecksCol
          .find({
            username: username,
            month: transaction.month,
            year: transaction.year,
          })
          .toArray();
        const updatedBudget = paychecks.reduce(
          (sum, current) => sum + current.net,
          0
        );

        // Get the total actual value for all categories
        const categories = await categoriesCol
          .find({
            username: username,
            month: transaction.month,
            year: transaction.year,
          })
          .toArray();
        const updatedActual = categories.reduce(
          (sum, current) => sum + current.actual,
          0
        );

        const updatedLeftover = updatedBudget - updatedActual;

        // Update the history month
        await historyCol.updateOne(
          {
            username: username,
            month: transaction.month,
            year: transaction.year,
          },
          {
            $set: {
              monthName: monthName,
              month: transaction.month,
              year: transaction.year,
              budget: updatedBudget,
              actual: updatedActual,
              leftover: updatedLeftover,
            },
          }
        );

        // Send a succes message back to the client
        res.status(200).json({ id: id, message: "Transaction was deleted" });
      } else {
        // Send an error message back to the client
        return res.status(404).send("Transaction not found");
      }
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res.status(500).send("Error occurred while deleting a transaction");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
