// API Endpoint for a user's categories data

import dollarsToCents from "@/helpers/dollarsToCents";
import clientPromise from "@/lib/mongodb";
import { updateFunMoney } from "@/lib/updateFunMoney";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";

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
    case "GET":
      return getCategories(req, res, categoriesContext);
    case "POST":
      return addCategory(req, res, categoriesContext);
    default:
      return res.status(405).send(`${req.method} method not allowed`);
  }
}

// Get the user's categories from MongoDB
async function getCategories(req, res, { categoriesCol, username }) {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    // Get the categories for the current month and year
    const categoriesDocs = await categoriesCol
      .find({ username, month, year })
      .toArray();

    // If the categories already exist, send the categories array back to the client
    if (categoriesDocs.length > 0) {
      const categories = categoriesDocs.map((category) => {
        const formattedCategory = {
          _id: category._id,
          name: category.name,
          color: category.color,
          fixed: category.fixed,
          budget: category.budget / 100,
          actual: category.actual / 100,
        };

        if (formattedCategory.fixed) {
          formattedCategory.dayOfMonth = category.dayOfMonth;
        }

        const subcategories = category.subcategories.map((subcategory) => {
          const formattedSubcategory = {
            id: subcategory.id,
            name: subcategory.name,
            actual: subcategory.actual / 100,
          };

          if (formattedCategory.fixed) {
            formattedSubcategory.dayOfMonth = subcategory.dayOfMonth;
          }

          return formattedSubcategory;
        });

        formattedCategory.subcategories = subcategories;

        return formattedCategory;
      });

      return res.status(200).json(categories);
    } else {
      // If the categories for the current month and year don't exist, get the categories from the last populated month
      const latestCategories = await categoriesCol
        .find(
          {
            username: username,
            $or: [
              { year: { $lt: year } },
              { year: year, month: { $lt: month } },
            ],
          },
          { projection: { month: 1, year: 1, _id: 0 } }
        )
        .sort({ year: -1, month: -1 })
        .limit(1)
        .toArray();

      if (latestCategories.length === 0) {
        throw new Error("User has no previous categories");
      }

      // Define the previous month and year
      const { month: previousMonth, year: previousYear } = latestCategories[0];

      // Get the previous categories and format it to a new month
      const previousCategories = await categoriesCol
        .aggregate([
          { $match: { username, month: previousMonth, year: previousYear } },
          {
            $project: {
              username: 1,
              name: 1,
              color: 1,
              budget: { $divide: ["$budget", 100] },
              actual: { $cond: ["$fixed", "$actual", 0] },
              fixed: 1,
              subcategories: 1,
              noDelete: 1,
              dayOfMonth: 1,
              _id: 0,
            },
          },
          { $sort: { budget: -1 } },
        ])
        .toArray();

      // Reset the non-fixed subcategories
      const newCategories = previousCategories.map((category) => {
        let formattedSubcategories;

        if (category.subcategories.length > 0) {
          formattedSubcategories = category.subcategories.map((subcategory) => {
            return {
              ...subcategory,
              id: uuidv4(),
              actual: category.fixed ? subcategory.actual : 0,
              dayOfMonth: category.fixed ? subcategory.dayOfMonth : null,
            };
          });
        } else {
          formattedSubcategories = category.subcategories;
        }

        return {
          ...category,
          subcategories: formattedSubcategories,
          month,
          year,
        };
      });

      // Insert the newly created categories into MongoDB
      const result = await categoriesCol.insertMany(newCategories);

      // Add each insertedId to the corresponding category
      const insertedCategories = newCategories.map((category, index) => {
        return {
          ...category,
          _id: result.insertedIds[index],
        };
      });

      // Send the categories array back to the client
      return res.status(200).json(insertedCategories);
    }
  } catch (error) {
    console.error(`GET categories request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while getting categories for ${username}`);
  }
}

// Add a new category for the user in MongoDB
async function addCategory(req, res, { client, categoriesCol, username }) {
  const mongoSession = await client.startSession();

  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    const categoryBody = req.body;

    // Convert the budget value to cents
    const categoryBudget = dollarsToCents(categoryBody.budget);
    let categoryActual = categoryBody.fixed ? categoryBudget : 0;

    // If category has fixed subcategories, update their actual values to cents
    let updatedSubcategories = categoryBody.subcategories;

    if (categoryBody.subcategories.length > 0) {
      if (categoryBody.fixed) {
        categoryActual = 0;
        updatedSubcategories = categoryBody.subcategories.map((subcategory) => {
          categoryActual += dollarsToCents(subcategory.actual);
          return {
            id: subcategory.id,
            name: subcategory.name.trim(),
            actual: dollarsToCents(subcategory.actual),
            dayOfMonth: parseInt(subcategory.dayOfMonth),
          };
        });
      } else {
        updatedSubcategories = categoryBody.subcategories.map((subcategory) => {
          return {
            id: subcategory.id,
            name: subcategory.name.trim(),
            actual: 0,
          };
        });
      }
    }

    const newCategory = {
      username,
      month,
      year,
      name: categoryBody.name.trim(),
      color: categoryBody.color,
      budget: categoryBudget,
      actual: categoryActual,
      fixed: categoryBody.fixed,
      subcategories: updatedSubcategories,
    };

    // A fixed category or subcategories date will pop up as a transaction on the budget's calendar
    if (newCategory.fixed) {
      if (newCategory.subcategories.length === 0) {
        newCategory.dayOfMonth = parseInt(categoryBody.dayOfMonth);
      } else {
        newCategory.dayOfMonth = null;
      }
    }

    let insertedCategory;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Add the new category to the categories collection in MongoDB
      insertedCategory = await categoriesCol.insertOne(newCategory, {
        session,
      });

      await updateFunMoney({ username, month, year, session });
    });

    const { username: u, month: m, year: y, ...categoryDetails } = newCategory;

    // Send the new category back to the client
    const addedCategory = {
      ...categoryDetails,
      _id: insertedCategory.insertedId,
      budget: categoryDetails.budget / 100,
      actual: categoryDetails.actual / 100,
    };

    addedCategory.subcategories = addedCategory.subcategories.map(
      (subcategory) => {
        return {
          ...subcategory,
          actual: subcategory.actual / 100,
        };
      }
    );

    return res.status(200).json(addedCategory);
  } catch (error) {
    console.error(`POST categories request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while adding a category for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}
