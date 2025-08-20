// API Endpoint for a user's categories data

import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";

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
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const categoriesCol = db.collection("categories");

  // Function that returns the user's categories from MongoDB
  async function getCategories() {
    let finalDocs = [];

    // Get the category documents for the current month and year
    const currentDocs = await categoriesCol
      .find({ username: username, month: month, year: year })
      .sort({ budget: 1 })
      .toArray();

    let categories = [];

    if (currentDocs.length > 0) {
      finalDocs = currentDocs;
    } else {
      // If the category documents for the current month and year don't exist, get the documents from last month
      let previousMonth = month - 1;
      let previousYear = year;

      if (previousMonth === 0) {
        previousMonth = 12;
        previousYear = year - 1;
      }
      const previousDocs = await categoriesCol
        .find({ username: username, month: previousMonth, year: previousYear })
        .sort({ budget: 1 })
        .toArray();

      const previousCategories = previousDocs.map((category) => {
        if (category.fixed) {
          return category;
        } else {
          if (category.hasSubcategory) {
            const newSubcategories = category.subcategories.map(
              (subcategory) => {
                // Reset the id for each subcategory
                return { ...subcategory, id: uuidv4(), actual: 0 };
              }
            );

            return {
              ...category,
              actual: 0,
              subcategories: newSubcategories,
            };
          } else {
            return { ...category, actual: 0 };
          }
        }
      });

      finalDocs = previousCategories;
    }

    categories = finalDocs.map((category) => {
      return {
        id: category._id,
        name: category.name,
        color: category.color,
        budget: category.budget,
        actual: category.actual,
        fixed: category.fixed,
        hasSubcategory: category.hasSubcategory,
        subcategories: category.subcategories,
      };
    });

    return categories;
  }

  async function updateCategories(edittedCategories) {
    // Update the given categories in MongoDB
    let numUpdated = 0;

    for (const category of edittedCategories) {
      const result = await categoriesCol.updateOne(
        { _id: new ObjectId(category.id) },
        {
          $set: {
            name: category.name,
            color: category.color,
            budget: category.budget,
            actual: category.actual,
            fixed: category.fixed,
            hasSubcategory: category.hasSubcategory,
            subcategories: category.subcategories,
          },
        }
      );

      if (result.modifiedCount === 1) {
        numUpdated++;
      }
    }

    return numUpdated === edittedCategories.length;
  }

  if (method === "GET") {
    try {
      const categories = await getCategories();

      // Send the categories array back to the client
      res.status(200).json(categories);
    } catch (err) {
      console.error(`${method} categories request failed: ${err}`);
      res
        .status(500)
        .send(`Error occurred while getting ${username}'s categories`);
    }
  } else if (method === "POST") {
    try {
      const categoryBody = req?.body;

      // Assign the identifiers to the category
      const newCategory = {
        username: username,
        month: month,
        year: year,
        ...categoryBody,
      };

      // Add the new category to the categories collection in MongoDB
      const result = await categoriesCol.insertOne(newCategory);

      // Send the new category back to the client
      res.status(200).json({ id: result.insertedId, ...newCategory });
    } catch (error) {
      console.error(`${method} categories request failed: ${error}`);
      res.status(500).send("Error occurred while adding a category");
    }
  } else if (method === "PUT") {
    try {
      const edittedCategories = req?.body;

      const results = await updateCategories(edittedCategories);

      if (results) {
        // Send the updated categories back to the client
        const categories = await getCategories();

        res.status(200).json(categories);
      } else {
        throw new Error("Categories could not be updated");
      }
    } catch (error) {
      console.error(`${method} categories request failed: ${error}`);
      res.status(500).send("Error occurred while updating categories");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
