// API Endpoint for a user's categories data

import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
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

    // Format the category's subcategories
    const editedSubcategories = [];

    if (category.subcategories.length > 0) {
      let subcategoryActual = 0;

      category.subcategories.forEach((subcategory) => {
        const formattedSubcategory = {
          _id: subcategory._id,
          parentCategoryId: subcategory.parentCategoryId,
          name: subcategory.name.trim(),
          actual: dollarsToCents(subcategory.actual),
        };

        if (editedCategory.fixed) {
          subcategoryActual += dollarsToCents(subcategory.actual);

          formattedSubcategory.frequency = subcategory.frequency;
          formattedSubcategory.dueDate = parseInt(subcategory.dueDate);
        }

        editedSubcategories.push(formattedSubcategory);
      });

      // Update the category's actual value to remain the same or if fixed, equal the new total of the new subcategories' actual value
      if (editedCategory.fixed) {
        if (editedSubcategories.length > 0) {
          editedCategory.actual = editedCategory.budget;
        } else {
          editedCategory.actual = subcategoryActual;
        }
      }
    }

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Update the new fields for the category in MongoDB
      const categoryQuery = {
        budget: editedCategory.budget,
        actual: editedCategory.actual,
      };

      if (editedCategory.fixed && editedSubcategories.length === 0) {
        categoryQuery.frequency = editedCategory.frequency;
        categoryQuery.dueDate = editedCategory.dueDate;
      }

      await categoriesCol.updateOne(
        { _id: new ObjectId(categoryId) },
        { $set: categoryQuery },
        { session },
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
        { session },
      );

      // Update the changes to any subcategory documents
      if (editedSubcategories.length > 0) {
        for (const subcategory of editedSubcategories) {
          const subcategoryQuery = {
            name: subcategory.name,
          };

          if (editedCategory.fixed) {
            subcategoryQuery.actual = subcategory.actual;
            subcategoryQuery.frequency = subcategory.frequency;
            subcategoryQuery.dueDate = subcategory.dueDate;
          }

          await categoriesCol.updateOne(
            { _id: new ObjectId(subcategory._id) },
            { $set: subcategoryQuery },
            { session },
          );
        }
      }

      // Update the Fun Money category for the category's month
      await updateFunMoney({
        username,
        month: editedCategory.month,
        year: editedCategory.year,
        session,
      });

      if (!editedCategory.fixed) {
        // If a non-fixed category's name was changed, update the correlating transactions' category field
        if (editedCategory.name !== editedCategory.currentName) {
          await transactionsCol.updateMany(
            {
              category: editedCategory.currentName,
              month: editedCategory.month,
              year: editedCategory.year,
            },
            {
              $set: {
                category: editedCategory.name,
              },
            },
            { session },
          );
        }

        // If any non-fixed subcategories' name was changed, update the correlating transactions' category field
        const changedSubcategories = category.subcategories.filter(
          (subcategory) => subcategory.nameChanged,
        );

        if (changedSubcategories.length > 0) {
          for (const subcategory of changedSubcategories) {
            await transactionsCol.updateMany(
              {
                category: subcategory.currentName,
                month: category.month,
                year: category.year,
              },
              {
                $set: {
                  category: subcategory.name,
                },
              },
              { session },
            );
          }
        }
      }
    });

    // Send the updated category back to the client
    const updatedCategory = {
      _id: categoryId,
      name: editedCategory.name,
      color: editedCategory.color,
      fixed: editedCategory.fixed,
      budget: centsToDollars(editedCategory.budget),
      actual: centsToDollars(editedCategory.actual),
    };

    updatedCategory.subcategories = editedSubcategories.map((subcategory) => {
      return {
        ...subcategory,
        actual: centsToDollars(subcategory.actual),
      };
    });

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(`PUT categories request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while deleting a category for ${username}`);
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
        { session },
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
        { session },
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
      .send(`Error occurred while deleting a category for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}
