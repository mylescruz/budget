// API Endpoint for a user's categories data

import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import clientPromise from "@/lib/mongodb";
import { updateFunMoney } from "@/lib/updateFunMoney";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { update } from "tar";

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
async function updateCategory(req, res, { client, categoriesCol, username }) {
  const mongoSession = client.startSession();

  try {
    const categoryId = req.query._id;
    const category = { ...req.body };

    // Define the category's edited fields
    const editedCategory = {
      month: category.month,
      year: category.year,
      name: category.name,
      currentName: category.currentName,
      color: category.color,
      fixed: category.fixed,
      budget: dollarsToCents(category.budget),
    };

    if (editedCategory.fixed && category.subcategories.length === 0) {
      editedCategory.frequency = category.frequency;
      editedCategory.dueDate = parseInt(category.dueDate);
    }

    // Format the category's subcategories
    const editedSubcategories = [];

    if (category.subcategories.length > 0) {
      let subcategoryBudget = 0;

      category.subcategories.forEach((subcategory) => {
        if (subcategory.deleted) {
          // Immediately send subcategory to the array to be deleted
          editedSubcategories.push(subcategory);
        } else if (subcategory.added) {
          // Immediately send subcategory to the array to be added to the database
          editedSubcategories.push(subcategory);
        } else {
          const formattedSubcategory = {
            _id: subcategory._id,
            parentCategoryId: categoryId,
            name: subcategory.name.trim(),
            budget: dollarsToCents(subcategory.budget),
          };

          if (editedCategory.fixed) {
            subcategoryBudget += dollarsToCents(subcategory.budget);

            formattedSubcategory.frequency = subcategory.frequency;
            formattedSubcategory.dueDate = parseInt(subcategory.dueDate);
          } else {
            // Get the categories' transaction total amount to send back to the client
            formattedSubcategory.actual = dollarsToCents(subcategory.actual);
          }

          editedSubcategories.push(formattedSubcategory);
        }
      });

      // Update a fixed category's budget value to equal the new total of the subcategories' budget value
      if (editedCategory.fixed && editedSubcategories.length > 0) {
        editedCategory.budget = subcategoryBudget;
      }
    }

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Update the changes to any subcategory documents and delete the remaining
      if (editedSubcategories.length > 0) {
        for (const subcategory of editedSubcategories) {
          if (subcategory.deleted) {
            // Delete the flagged subcategories
            await categoriesCol.deleteOne(
              { _id: new ObjectId(subcategory._id) },
              { session, maxTimeMS: 5000 },
            );
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
            };

            if (editedCategory.fixed) {
              formattedSubcategory.budget = dollarsToCents(subcategory.budget);
              formattedSubcategory.dueDate = parseInt(subcategory.dueDate);
              formattedSubcategory.frequency = subcategory.frequency;

              // Update the parent category's budget to account for the new subcategory
              editedCategory.budget += dollarsToCents(subcategory.budget);
            }

            await categoriesCol.insertOne(formattedSubcategory, {
              session,
              maxTimeMS: 5000,
            });
          } else {
            const subcategoryQuery = {
              name: subcategory.name,
            };

            if (editedCategory.fixed) {
              subcategoryQuery.budget = subcategory.budget;
              subcategoryQuery.frequency = subcategory.frequency;
              subcategoryQuery.dueDate = subcategory.dueDate;
            }

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
      };

      if (editedCategory.fixed && editedSubcategories.length === 0) {
        categoryQuery.frequency = editedCategory.frequency;
        categoryQuery.dueDate = editedCategory.dueDate;
      }

      await categoriesCol.updateOne(
        { _id: new ObjectId(categoryId) },
        { $set: categoryQuery },
        { session, maxTimeMS: 5000 },
      );

      // Update the name and color for all the categories with that name
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

    const today = new Date();

    let categoryActual = 0;
    let categoryBudget = 0;

    // Filter for the subcategories without the deleted categories
    const filteredSubcategories = editedSubcategories.filter(
      (subcategory) => !subcategory.deleted,
    );

    if (filteredSubcategories.length === 0) {
      categoryBudget = centsToDollars(editedCategory.budget);
    } else {
      // Return and with the formatted budget and actual values
      updatedCategory.subcategories = filteredSubcategories.map(
        (subcategory) => {
          if (subcategory.added) {
            subcategory.budget = dollarsToCents(subcategory.budget);
          }

          if (editedCategory.fixed) {
            let subcategoryActual = 0;

            const subcategoryDate = new Date(
              `${editedCategory.month}/${subcategory.dueDate}/${editedCategory.year}`,
            );

            // Increment the fixed subcategory actual if the charge date passed
            if (subcategoryDate <= today) {
              subcategoryActual = subcategory.budget;
            }

            categoryBudget += subcategory.budget;
            categoryActual += subcategoryActual;

            const formattedSubcategory = {
              ...subcategory,
              budget: centsToDollars(subcategory.budget),
              actual: centsToDollars(subcategoryActual),
            };

            return formattedSubcategory;
          } else {
            // Automatically increment variable actual values
            categoryActual += subcategory.actual;

            return {
              ...subcategory,
              actual: centsToDollars(subcategory.actual),
            };
          }
        },
      );
    }

    // Format the final category values
    updatedCategory.budget = updatedCategory.fixed
      ? centsToDollars(categoryBudget)
      : centsToDollars(editedCategory.budget);
    updatedCategory.actual = centsToDollars(categoryActual);

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(`PUT categories request failed for ${username}: ${error}`);
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
async function deleteCategory(req, res, { client, categoriesCol, username }) {
  const mongoSession = client.startSession();

  try {
    const categoryId = req.query._id;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Find the category in the database to update the month's Fun Money category
      const category = await categoriesCol.findOne(
        {
          _id: new ObjectId(categoryId),
        },
        { session, maxTimeMS: 5000 },
      );

      if (!category) {
        throw new Error("Category not found!");
      }

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
    console.error(`DELETE category request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(
        "We're unable to delete this category at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}
