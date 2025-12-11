// API Endpoint for a user's categories data

import clientPromise from "@/lib/mongodb";
import { updateGuiltFreeSpending } from "@/lib/updateGuiltFreeSpending";
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
    const category = req.body;

    category.budget = parseFloat(category.budget) * 100;
    category.dayOfMonth =
      category.fixed && category.subcategories.length === 0
        ? parseInt(category.dayOfMonth)
        : null;

    let subcategoryTotal = 0;
    category.subcategories = category.subcategories.map((subcategory) => {
      if (category.fixed) {
        subcategoryTotal += subcategory.actual;

        return {
          id: subcategory.id,
          name: subcategory.name,
          actual: subcategory.actual,
          dayOfMonth: parseInt(subcategory.dayOfMonth),
        };
      } else {
        return {
          id: subcategory.id,
          name: subcategory.name,
          actual: subcategory.actual,
          dayOfMonth: subcategory.dayOfMonth,
        };
      }
    });

    if (category.fixed && category.subcategories.length === 0) {
      category.actual = categoryBudget;
    } else if (category.fixed && category.subcategories.length === 0) {
      category.actual = subcategoryTotal;
    } else {
      category.actual = category.actual * 100;
    }

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Update the new fields for the category in MongoDB
      await categoriesCol.updateOne(
        { _id: new ObjectId(categoryId) },
        {
          $set: {
            name: category.name,
            budget: category.budget,
            actual: category.actual,
            dayOfMonth: category.dayOfMonth,
            hasSubcategory: category.subcategories.length > 0 ? true : false,
            subcategories: category.subcategories,
          },
        },
        { session }
      );

      // Update the color for all the categories with that name
      await categoriesCol.updateMany(
        { username, name: category.name },
        {
          $set: {
            color: category.color,
          },
        },
        { session }
      );

      // Update the Guilt Free Spending category for the category's month
      await updateGuiltFreeSpending({
        username,
        month: category.month,
        year: category.year,
        session,
      });
    });

    // // Send the updated category back to the client
    return res.status(200).json(category);
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
    const category = req.body;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Delete category from MongoDB
      await categoriesCol.deleteOne(
        { _id: new ObjectId(categoryId) },
        { session }
      );

      // Update the Guilt Free Spending category for the category's month
      await updateGuiltFreeSpending({
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
