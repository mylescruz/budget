// API Endpoint for a user's categories data

import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";
import { logError } from "@/lib/logError";
import clientPromise from "@/lib/mongodb";
import { updateFunMoney } from "@/lib/updateFunMoney";
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

  const categoriesContext = {
    client: client,
    categoriesCol: db.collection("categories"),
    transactionsCol: db.collection("transactions"),
    username: session.user.username,
  };

  switch (req.method) {
    case "PUT":
      return updateCategory(req, res, categoriesContext);
    case "DELETE":
      return deleteCategory(req, res, categoriesContext);
    default:
      return res.status(405).send(`${req.method} method not allowed`);
  }
}

// Update an editted category in MongoDB
async function updateCategory(
  req,
  res,
  { client, categoriesCol, transactionsCol, username },
) {
  const mongoSession = client.startSession();

  try {
    const categoryId = req.query._id;
    const category = { ...req.body };

    const currentTS = new Date();

    // Define the category's edited fields
    const editedCategory = {
      month: category.month,
      year: category.year,
      name: category.name,
      currentName: category.currentName,
      color: category.color,
      fixed: category.fixed,
      budget: dollarsToCents(category.budget),
      actual: dollarsToCents(category.actual),
    };

    if (editedCategory.fixed && category.subcategories.length === 0) {
      editedCategory.frequency = category.frequency;
      editedCategory.dueDate = parseInt(category.dueDate);
    }

    // Array to update the category or subcategories' correlating fixed transaction
    const updatedTransactions = [];

    // Array to store the updated subcategories
    const finalSubcategories = [];

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Update the changes to any subcategory documents and delete the remaining
      if (category.subcategories.length > 0) {
        for (const subcategory of category.subcategories) {
          if (subcategory.deleted) {
            // Delete the flagged subcategories
            await categoriesCol.deleteOne(
              { _id: new ObjectId(subcategory._id) },
              { session, maxTimeMS: 5000 },
            );

            if (editedCategory.fixed) {
              // Delete the correlating fixed subcategory's transaction
              const subcategoryTransaction =
                await transactionsCol.findOneAndDelete(
                  { categoryId: new ObjectId(subcategory._id) },
                  { session, maxTimeMS: 5000 },
                );

              updatedTransactions.push({
                _id: subcategoryTransaction._id,
                deleted: true,
              });
            }
          } else if (subcategory.added) {
            // Add the new subcategory to the budget
            const formattedSubcategory = {
              username,
              month: category.month,
              year: category.year,
              name: subcategory.name,
              color: editedCategory.color,
              fixed: editedCategory.fixed,
              parentCategoryId: categoryId,
              createdTS: currentTS,
              updatedTS: currentTS,
            };

            if (editedCategory.fixed) {
              formattedSubcategory.budget = dollarsToCents(subcategory.budget);
              formattedSubcategory.dueDate = parseInt(subcategory.dueDate);
              formattedSubcategory.frequency = subcategory.frequency;
            }

            // Insert the new subcategory
            const insertedSubcategory = await categoriesCol.insertOne(
              formattedSubcategory,
              {
                session,
                maxTimeMS: 5000,
              },
            );

            // Add the subcategory to the final array of subcategories with its new _id
            finalSubcategories.push({
              ...formattedSubcategory,
              _id: insertedSubcategory.insertedId,
            });

            // Create a new fixed transaction for a fixed subcategory
            if (formattedSubcategory.fixed) {
              const subcategoryDate = new Date(
                category.year,
                category.month - 1,
                formattedSubcategory.dueDate,
              );

              const newTransaction = {
                username,
                month: category.month,
                year: category.year,
                type: TRANSACTION_TYPES.EXPENSE,
                date: subcategoryDate,
                fixed: true,
                store: formattedSubcategory.name,
                items: `Fixed expense occuring ${formattedSubcategory.frequency.toLowerCase()}`,
                categoryId: insertedSubcategory.insertedId,
                parentCategoryId: categoryId,
                amount: formattedSubcategory.budget,
                createdTS: currentTS,
                updatedTS: currentTS,
              };

              updatedTransactions.push(newTransaction);
            }
          } else {
            // Make changes to any edited subcategories
            const formattedSubcategory = {
              _id: subcategory._id,
              username,
              month: category.month,
              year: category.year,
              name: subcategory.name.trim(),
              color: editedCategory.color,
              fixed: editedCategory.fixed,
              actual: dollarsToCents(subcategory.actual),
              parentCategoryId: categoryId,
              updatedTS: currentTS,
            };

            // Query object to update the subcategory in the database
            const subcategoryQuery = {
              name: formattedSubcategory.name,
              updatedTS: currentTS,
            };

            if (editedCategory.fixed) {
              // Format the subcategory's fixed fields
              const subcategoryBudget = dollarsToCents(subcategory.budget);
              const dueDate = parseInt(subcategory.dueDate);

              // Define the fields in the query object to update in the database
              subcategoryQuery.budget = subcategoryBudget;
              subcategoryQuery.dueDate = dueDate;
              subcategoryQuery.frequency = formattedSubcategory.frequency;

              // Format the subcategory being returned to the client
              formattedSubcategory.budget = subcategoryBudget;
              formattedSubcategory.dueDate = dueDate;
              formattedSubcategory.frequency = subcategory.frequency;
            }

            // Add the updated subcategory to the final array of subcategories
            finalSubcategories.push(formattedSubcategory);

            if (editedCategory.fixed) {
              // Update the correlating fixed subcategory's transaction
              const subcategoryTransaction = await transactionsCol.findOne(
                {
                  categoryId: new ObjectId(formattedSubcategory._id),
                },
                { session, maxTimeMS: 3000 },
              );

              const subcategoryDate = new Date(
                category.year,
                category.month - 1,
                subcategory.dueDate,
              );

              // Update the changed subcategory fields
              const updatedTransaction = {
                ...subcategoryTransaction,
                date: subcategoryDate,
                store: formattedSubcategory.name,
                items: `Fixed expense occuring ${formattedSubcategory.frequency.toLowerCase()}`,
                amount: formattedSubcategory.budget,
                updatedTS: currentTS,
              };

              updatedTransactions.push(updatedTransaction);
            } else {
              // Change the category name for the correlating variable transactions to send back to the client
              if (formattedSubcategory.name !== subcategory.currentName) {
                // Fetch the current transactions associated with this subcategory
                const subcategoryTransactions = await transactionsCol
                  .find({ categoryId: new ObjectId(subcategory._id) })
                  .toArray();

                // If there are transactions under this subcategory, change their category name
                if (subcategoryTransactions.length > 0) {
                  const formattedTransactions = subcategoryTransactions.map(
                    (subcat) => {
                      return {
                        ...subcat,
                        category: formattedSubcategory.name,
                      };
                    },
                  );

                  formattedTransactions.forEach((transaction) =>
                    updatedTransactions.push(transaction),
                  );
                }
              }
            }

            // Update the subcategory's information in the database
            await categoriesCol.updateOne(
              { _id: new ObjectId(subcategory._id) },
              { $set: subcategoryQuery },
              { session, maxTimeMS: 5000 },
            );
          }
        }
      }

      // Update the new fields for the category in MongoDB
      const categoryQuery = {
        budget: editedCategory.budget,
        updatedTS: currentTS,
      };

      if (editedCategory.fixed) {
        if (finalSubcategories.length === 0) {
          // Set the fixed fields for a fixed category with no subcategories
          categoryQuery.frequency = editedCategory.frequency;
          categoryQuery.dueDate = editedCategory.dueDate;

          // Update the correlating fixed category's transaction
          const categoryTransaction = await transactionsCol.findOne(
            { categoryId: new ObjectId(categoryId) },
            { session, maxTimeMS: 3000 },
          );

          const categoryDate = new Date(
            category.year,
            category.month - 1,
            editedCategory.dueDate,
          );

          // Update the changed category fields for the correlating fixed transaction
          const updatedTransaction = {
            ...categoryTransaction,
            date: categoryDate,
            store: editedCategory.name,
            items: `Fixed expense occuring ${editedCategory.frequency.toLowerCase()}`,
            amount: editedCategory.budget,
            updatedTS: currentTS,
          };

          updatedTransactions.push(updatedTransaction);
        }
      } else {
        // Change the category name for the correlating transactions to send back to the client
        if (editedCategory.name !== editedCategory.currentName) {
          // Fetch the current transactions associated with this subcategory
          const categoryTransactions = await transactionsCol
            .find({ categoryId: new ObjectId(editedCategory._id) })
            .toArray();

          // If there are transactions under this category, change their category name
          if (categoryTransactions.length > 0) {
            const formattedTransactions = categoryTransactions.map((cat) => {
              return {
                ...cat,
                category: editedCategory.name,
              };
            });

            formattedTransactions.forEach((transaction) =>
              updatedTransactions.push(transaction),
            );
          }
        }
      }

      // Update the parent category details
      await categoriesCol.updateOne(
        { _id: new ObjectId(categoryId) },
        { $set: categoryQuery },
        { session, maxTimeMS: 5000 },
      );

      // Update the correlating fixed transactions in the database
      for (const transaction of updatedTransactions) {
        if (transaction.fixed) {
          // Define the fields to be inserted if a subcategory was added to the database
          const setOnInsert = {
            username: transaction.username,
            month: transaction.month,
            year: transaction.year,
            type: transaction.type,
            fixed: true,
            categoryId: transaction.categoryId,
            createdTS: currentTS,
          };

          if (transaction.parentCategoryId) {
            setOnInsert.parentCategoryId = transaction.parentCategoryId;
          }

          await transactionsCol.updateOne(
            { _id: new ObjectId(transaction._id) },
            {
              $set: {
                date: transaction.date,
                store: transaction.store,
                items: transaction.items,
                amount: transaction.amount,
                updatedTS: currentTS,
              },
              $setOnInsert: setOnInsert,
            },
            { upsert: true, session, maxTimeMS: 3000 },
          );
        }
      }

      // Update the name for all the categories with that name
      await categoriesCol.updateMany(
        { username, name: editedCategory.currentName },
        {
          $set: {
            name: editedCategory.name.trim(),
            color: editedCategory.color,
          },
        },
        { session, maxTimeMS: 5000 },
      );

      // Get all the past parent categories that match the category's name
      const parentCategories = await categoriesCol
        .aggregate(
          [
            { $match: { username, name: editedCategory.name } },
            { $project: { _id: 1 } },
          ],
          {
            session,
            maxTimeMS: 5000,
          },
        )
        .toArray();

      // Update each subcategory under this category's name with the new color
      await categoriesCol.updateMany(
        {
          parentCategoryId: {
            $in: parentCategories.map((category) => new ObjectId(category._id)),
          },
        },
        {
          $set: {
            color: editedCategory.color,
          },
        },
        { session, maxTimeMS: 5000 },
      );

      // Update the Fun Money category for the category's month
      await updateFunMoney({
        username,
        month: editedCategory.month,
        year: editedCategory.year,
        session,
      });
    });

    // Send the updated category back to the client
    const updatedCategory = {
      _id: categoryId,
      name: editedCategory.name,
      color: editedCategory.color,
      fixed: editedCategory.fixed,
    };

    let categoryActual = 0;
    let categoryBudget = 0;

    if (finalSubcategories.length === 0) {
      categoryBudget = editedCategory.budget;
      updatedCategory.subcategories = [];

      if (updatedCategory.fixed) {
        updatedCategory.dueDate = editedCategory.dueDate;
        updatedCategory.frequency = editedCategory.frequency;

        const categoryDate = new Date(
          editedCategory.year,
          editedCategory.month - 1,
          editedCategory.dueDate,
        );

        // Increment the fixed category actual if the charge date passed
        if (categoryDate <= currentTS) {
          categoryActual = categoryBudget;
        }
      } else {
        categoryActual = editedCategory.actual;
      }
    } else {
      // Format the subcategories to be sent back to the client
      updatedCategory.subcategories = finalSubcategories.map((subcategory) => {
        if (editedCategory.fixed) {
          let subcategoryActual = 0;

          const subcategoryDate = new Date(
            editedCategory.year,
            editedCategory.month - 1,
            subcategory.dueDate,
          );

          // Increment the fixed subcategory actual if the charge date passed
          if (subcategoryDate <= currentTS) {
            subcategoryActual = subcategory.budget;
          }

          categoryBudget += subcategory.budget;
          categoryActual += subcategoryActual;

          return {
            ...subcategory,
            budget: centsToDollars(subcategory.budget),
            actual: centsToDollars(subcategoryActual),
          };
        } else {
          // Automatically increment variable actual values
          const subcategoryActual = subcategory.actual ?? 0;

          categoryActual += subcategoryActual;

          return {
            ...subcategory,
            actual: centsToDollars(subcategoryActual),
          };
        }
      });
    }

    // Format the final category values
    updatedCategory.budget = updatedCategory.fixed
      ? centsToDollars(categoryBudget)
      : centsToDollars(editedCategory.budget);
    updatedCategory.actual = centsToDollars(categoryActual);

    // Format the updated transactions back to the client
    if (updatedTransactions.length > 0) {
      updatedCategory.updatedTransactions = updatedTransactions.map(
        (transaction) => {
          const formattedTransaction = {
            ...transaction,
            amount: centsToDollars(transaction.amount),
            color: updatedCategory.color,
          };

          if (transaction.fixed) {
            formattedTransaction.category = transaction.store;
          }

          return formattedTransaction;
        },
      );
    }

    return res.status(200).json(updatedCategory);
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to update this category at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}

// Delete a category from a user in MongoDB
async function deleteCategory(
  req,
  res,
  { client, categoriesCol, transactionsCol, username },
) {
  const mongoSession = client.startSession();

  try {
    const categoryId = req.query._id;
    const category = req.body;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Delete the category and subcategories from MongoDB
      await categoriesCol.deleteMany(
        {
          $or: [
            { _id: new ObjectId(categoryId) },
            { parentCategoryId: new ObjectId(categoryId) },
          ],
        },
        { session, maxTimeMS: 5000 },
      );

      // Delete a fixed category or fixed subcategories' correlating transactions
      if (category.fixed) {
        const deletedIds = [];

        if (category.subcategories.length > 0) {
          category.subcategories.forEach((subcategory) =>
            deletedIds.push(subcategory._id),
          );
        } else {
          deletedIds.push(categoryId);
        }

        await transactionsCol.deleteMany(
          {
            categoryId: { $in: deletedIds.map((id) => new ObjectId(id)) },
          },
          { session, maxTimeMS: 5000 },
        );
      }

      // Update the Fun Money category for the category's month
      await updateFunMoney({
        username,
        month: category.month,
        year: category.year,
        session,
      });
    });

    // Send a success message back to the client
    return res
      .status(200)
      .json({ _id: categoryId, message: "Category deleted successfully" });
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to delete this category at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}
