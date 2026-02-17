// API Endpoint for a user's categories data

import centsToDollars from "@/helpers/centsToDollars";
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
async function getCategories(req, res, { client, categoriesCol, username }) {
  const mongoSession = await client.startSession();

  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    let categories = [];

    await mongoSession.withTransaction(async (session) => {
      categories = await getCurrentCategories(
        username,
        month,
        year,
        categoriesCol,
        session,
      );
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error(`GET categories request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while getting categories for ${username}`);
  } finally {
    await mongoSession.endSession();
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
            frequency: subcategory.frequency,
            dueDate: parseInt(subcategory.dueDate),
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
        newCategory.frequency = categoryBody.frequency;
        newCategory.dueDate = parseInt(categoryBody.dueDate);
      } else {
        newCategory.frequency = null;
        newCategory.dueDate = null;
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
      budget: centsToDollars(categoryDetails.budget),
      actual: centsToDollars(categoryDetails.actual),
    };

    addedCategory.subcategories = addedCategory.subcategories.map(
      (subcategory) => {
        return {
          ...subcategory,
          actual: centsToDollars(subcategory.actual),
        };
      },
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

async function getCurrentCategories(
  username,
  month,
  year,
  categoriesCol,
  session,
) {
  // Get the categories for the current month and year
  const categoriesDocs = await categoriesCol
    .find({ username, month, year }, { session })
    .toArray();

  // If the categories already exist, send the categories array back to the client
  if (categoriesDocs.length > 0) {
    const categories = categoriesDocs
      .map((category) => {
        const formattedCategory = {
          _id: category._id,
          name: category.name,
          color: category.color,
          fixed: category.fixed,
          budget: centsToDollars(category.budget),
          actual: centsToDollars(category.actual),
        };

        if (formattedCategory.fixed) {
          formattedCategory.frequency = category.frequency;
          formattedCategory.dueDate = category.dueDate;
        }

        const subcategories = category.subcategories.map((subcategory) => {
          const formattedSubcategory = {
            id: subcategory.id,
            name: subcategory.name,
            actual: centsToDollars(subcategory.actual),
          };

          if (formattedCategory.fixed) {
            formattedSubcategory.frequency = subcategory.frequency;
            formattedSubcategory.dueDate = subcategory.dueDate;
          }

          return formattedSubcategory;
        });

        formattedCategory.subcategories = subcategories;

        if (formattedCategory.name === "Fun Money") {
          formattedCategory.noDelete = true;
        }

        return formattedCategory;
      })
      .sort((a, b) => b.budget - a.budget);

    return categories;
  } else {
    return await getPreviousCategories(
      username,
      month,
      year,
      categoriesCol,
      session,
    );
  }
}

// If the categories for the current month and year don't exist, get the categories from the last populated month
async function getPreviousCategories(
  username,
  month,
  year,
  categoriesCol,
  session,
) {
  const latestCategories = await categoriesCol
    .find(
      {
        username: username,
        $or: [{ year: { $lt: year } }, { year: year, month: { $lt: month } }],
      },
      { projection: { month: 1, year: 1, _id: 0 } },
      { session },
    )
    .sort({ year: -1, month: -1 })
    .limit(1)
    .toArray();

  if (latestCategories.length === 0) {
    throw new Error("User has no previous categories");
  }

  // Define the previous month and year
  const { month: previousMonth, year: previousYear } = latestCategories[0];

  // Set the semi-annual month filters
  const semiAnnualMonth =
    previousMonth - 6 <= 0 ? previousMonth + 6 : previousMonth - 6;
  const semiAnnualYear =
    previousMonth - 6 <= 0 ? previousYear - 1 : previousYear;

  // Set the annual month filters
  const annualMonth = previousMonth;
  const annualYear = previousYear - 1;

  // Get the non-fixed categories from last month and the fixed monthly, semi-annual and annual categories
  const previousCategories = await categoriesCol
    .aggregate([
      {
        $match: {
          username,
          $or: [
            { month: previousMonth, year: previousYear },
            {
              month: semiAnnualMonth,
              year: semiAnnualYear,
              frequency: "Semi-Annually",
            },
            {
              month: annualMonth,
              year: annualYear,
              frequency: "Annually",
            },
          ],
        },
      },
      {
        $match: {
          $or: [
            { fixed: false },
            {
              fixed: true,
              frequency: { $in: ["Monthly", "Semi-Annually", "Annually"] },
            },
            {
              fixed: true,
              subcategories: {
                $elemMatch: { frequency: "Monthly" },
              },
            },
          ],
        },
      },
      {
        $project: {
          username: 1,
          name: 1,
          color: 1,
          budget: 1,
          actual: { $cond: ["$fixed", "$actual", 0] },
          fixed: 1,
          frequency: 1,
          subcategories: 1,
          noDelete: 1,
          dueDate: 1,
          _id: 0,
        },
      },
      { $sort: { budget: -1 } },
      { session },
    ])
    .toArray();

  // Reset the non-fixed subcategories
  const newCategories = previousCategories.map((category) => {
    let formattedSubcategories;

    if (category.subcategories.length > 0) {
      formattedSubcategories = category.subcategories
        .map((subcategory) => {
          if (category.fixed) {
            return {
              ...subcategory,
              id: uuidv4(),
              actual: subcategory.actual,
              frequency: subcategory.frequency,
              dueDate: subcategory.dueDate,
            };
          } else {
            return {
              ...subcategory,
              id: uuidv4(),
              actual: 0,
            };
          }
        })
        .filter((subcategory) => {
          return (
            !category.fixed ||
            (category.fixed && subcategory.frequency === "Monthly")
          );
        });
    } else {
      formattedSubcategories = category.subcategories;
    }

    const formattedCategory = {
      username: category.username,
      month,
      year,
      name: category.name,
      color: category.color,
      budget: category.budget,
      actual: category.actual,
      fixed: category.fixed,
      subcategories: formattedSubcategories,
    };

    if (formattedCategory.fixed) {
      if (formattedCategory.subcategories.length > 0) {
        formattedCategory.frequency = null;
        formattedCategory.dueDate = null;
      } else {
        formattedCategory.frequency = category.frequency;
        formattedCategory.dueDate = category.dueDate;
      }
    }

    if (formattedCategory.name === "Fun Money") {
      formattedCategory.noDelete = true;
    }

    return formattedCategory;
  });

  // Insert the newly created categories into MongoDB
  await categoriesCol.insertMany(newCategories, { session });

  return await getCurrentCategories(
    username,
    month,
    year,
    categoriesCol,
    session,
  );
}
