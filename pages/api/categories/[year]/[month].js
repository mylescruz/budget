// API Endpoint for a user's categories data

import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import clientPromise from "@/lib/mongodb";
import { updateFunMoney } from "@/lib/updateFunMoney";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
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

    const newCategory = { ...req.body };

    let categoryBudget = 0;

    const newSubcategories = [];

    // Format each subcategory to be added to the database
    if (newCategory.subcategories.length === 0) {
      // Convert the budget value to cents
      categoryBudget = dollarsToCents(newCategory.budget);
    } else {
      newCategory.subcategories.forEach((subcategory) => {
        const formattedSubcategory = {
          username,
          month,
          year,
          name: subcategory.name.trim(),
          color: newCategory.color,
          fixed: newCategory.fixed,
        };

        if (newCategory.fixed) {
          const subcategoryBudget = dollarsToCents(subcategory.budget);

          // Increment the parent category's budget field
          categoryBudget += subcategoryBudget;

          // Define the fixed fields
          formattedSubcategory.budget = subcategoryBudget;
          formattedSubcategory.frequency = subcategory.frequency;
          formattedSubcategory.dueDate = parseInt(subcategory.dueDate);
        }

        newSubcategories.push(formattedSubcategory);
      });
    }

    // Format the new category for the database
    const formattedCategory = {
      username,
      month,
      year,
      name: newCategory.name.trim(),
      color: newCategory.color,
      budget: categoryBudget,
      fixed: newCategory.fixed,
    };

    // A fixed category or subcategory date will pop up as a transaction on the budget's calendar
    if (formattedCategory.fixed) {
      if (newSubcategories.length === 0) {
        formattedCategory.frequency = newCategory.frequency;
        formattedCategory.dueDate = parseInt(newCategory.dueDate);
      }
    }

    let insertedCategory;
    let insertedSubcategories;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      insertedCategory = await categoriesCol.insertOne(formattedCategory, {
        session,
      });

      if (newSubcategories.length > 0) {
        // Map the parent category _id to each subcategory
        const formattedSubcategories = newSubcategories.map((subcategory) => {
          return {
            ...subcategory,
            parentCategoryId: insertedCategory.insertedId,
          };
        });

        insertedSubcategories = await categoriesCol.insertMany(
          formattedSubcategories,
          { session },
        );
      }

      await updateFunMoney({ username, month, year, session });
    });

    const today = new Date();

    let categoryActual = 0;

    const addedSubcategories = [];

    if (newSubcategories.length > 0) {
      // Add the inserted _id to each subcategory and format the budget and actual values to be sent back to the client
      newSubcategories.forEach((subcategory, index) => {
        const formattedSubcategory = {
          _id: insertedSubcategories.insertedIds[index],
          name: subcategory.name,
          fixed: subcategory.fixed,
        };

        if (subcategory.fixed) {
          formattedSubcategory.budget = centsToDollars(subcategory.budget);
          formattedSubcategory.frequency = subcategory.frequency;
          formattedSubcategory.dueDate = subcategory.dueDate;

          const subcategoryDate = new Date(
            `${month}/${subcategory.dueDate}/${year}`,
          );

          if (subcategoryDate <= today) {
            // Charge a fixed parent's actual value to the total if their charge date already passed
            formattedSubcategory.actual = formattedSubcategory.budget;
          } else {
            formattedSubcategory.actual = 0;
          }
        } else {
          formattedSubcategory.actual = 0;
        }

        categoryActual += formattedSubcategory;

        addedSubcategories.push(formattedSubcategory);
      });
    }

    // Send the new category back to the client
    const addedCategory = {
      _id: insertedCategory.insertedId,
      name: formattedCategory.name,
      color: formattedCategory.color,
      fixed: formattedCategory.fixed,
      budget: centsToDollars(formattedCategory.budget),
      actual: centsToDollars(categoryActual),
      subcategories: addedSubcategories,
    };

    if (addedCategory.fixed) {
      addedCategory.frequency = formattedCategory.frequency;
      addedCategory.dueDate = formattedCategory.dueDate;
    }

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
  // Fetch all the user's categories for the given month and year with the sum of each category's correlating transaction amounts
  const categoriesDocs = await categoriesCol
    .aggregate(
      [
        { $match: { username, month, year } },
        {
          $lookup: {
            from: "transactions",
            localField: "_id",
            foreignField: "categoryId",
            pipeline: [
              { $match: { username, month, year } },
              { $project: { category: 1, amount: 1 } },
            ],
            as: "transactions",
          },
        },
        {
          $addFields: {
            transactionsAmount: { $sum: "$transactions.amount" },
          },
        },
        {
          $project: {
            transactions: 0,
          },
        },
      ],
      { session },
    )
    .toArray();

  // If the categories don't exist, fetch the last budget month's categories
  if (categoriesDocs.length === 0) {
    return await getPreviousCategories(
      username,
      month,
      year,
      categoriesCol,
      session,
    );
  }

  // Create a map object to place the subcategories with the correlating parent category
  const categoriesMap = new Map();

  // Filter the parent and subcategories
  const parentCategories = [];
  const subcategories = [];

  categoriesDocs.forEach((category) => {
    if (!category.parentCategoryId) {
      parentCategories.push(category);
    } else {
      subcategories.push(category);
    }
  });

  // Used for fixed categories to determine if their actual value has been charged yet
  const today = new Date();

  // Format each parent category
  parentCategories.forEach((category) => {
    const formattedCategory = {
      _id: category._id,
      username: category.username,
      month: category.month,
      year: category.year,
      name: category.name,
      color: category.color,
      fixed: category.fixed,
      budget: category.budget,
      subcategories: [],
    };

    if (formattedCategory.fixed) {
      formattedCategory.frequency = category.frequency;
      formattedCategory.dueDate = category.dueDate;

      if (category.dueDate) {
        const categoryDate = new Date(`${month}/${category.dueDate}/${year}`);

        if (categoryDate <= today) {
          // Charge a fixed parent's actual value to the total if their charge date already passed
          formattedCategory.actual = category.actual;
        } else {
          // Apply no charge if their charge date hasn't passed
          formattedCategory.actual = 0;
        }
      } else {
        // A fixed parent with subcategories has no dueDate and therefore, set the actual value to 0 to sum the subcategories
        formattedCategory.actual = 0;
      }
    } else {
      // A non-fixed parent's value should be equal to the sum of their transactions
      formattedCategory.actual = category.transactionsAmount;
    }

    // Add the noDelete flag to the Fun Money category
    if (formattedCategory.name === "Fun Money") {
      formattedCategory.noDelete = true;
    }

    categoriesMap.set(category._id.toString(), formattedCategory);
  });

  // Format each subcategory and place it in the parent category's subcategories array
  subcategories.forEach((subcategory) => {
    const formattedSubcategory = {
      _id: subcategory._id,
      name: subcategory.name,
      fixed: subcategory.fixed,
    };

    if (formattedSubcategory.fixed) {
      formattedSubcategory.budget = subcategory.budget;
      formattedSubcategory.frequency = subcategory.frequency;
      formattedSubcategory.dueDate = subcategory.dueDate;

      const subcategoryDate = new Date(
        `${month}/${subcategory.dueDate}/${year}`,
      );

      if (subcategoryDate <= today) {
        // Charge a fixed parent's actual value to the total if their charge date already passed
        formattedSubcategory.actual = subcategory.budget;
      } else {
        formattedSubcategory.actual = 0;
      }
    } else {
      formattedSubcategory.actual = subcategory.transactionsAmount;
    }

    const foundParent = categoriesMap.get(
      subcategory.parentCategoryId.toString(),
    );

    if (foundParent) {
      foundParent.actual += formattedSubcategory.actual;

      // Format the subcategory's budget and actual value to be sent back to the client in USD
      formattedSubcategory.actual = centsToDollars(formattedSubcategory.actual);

      if (formattedSubcategory.fixed) {
        formattedSubcategory.budget = centsToDollars(
          formattedSubcategory.budget,
        );
      }

      // Embed the subcategory in the parent category
      foundParent.subcategories.push(formattedSubcategory);
    }
  });

  // Format the category's budget and actual values to be sent back to the client in USD
  // Sort the subcategories by due date and the categories by budget
  const categories = [...categoriesMap.values()]
    .map((category) => {
      return {
        ...category,
        budget: centsToDollars(category.budget),
        actual: centsToDollars(category.actual),
        subcategories: category.subcategories.sort(
          (a, b) => a.dueDate - b.dueDate,
        ),
      };
    })
    .sort((a, b) => b.budget - a.budget);

  return categories;
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

  // Create the missing category months
  await generateMissingMonths({
    username,
    previous: { month: previousMonth, year: previousYear },
    current: { month: month, year: year },
    categoriesCol,
    session,
  });

  // Refetch the newly created categories
  return await getCurrentCategories(
    username,
    month,
    year,
    categoriesCol,
    session,
  );
}

// Creates the missing category months from the latest month to the current month
async function generateMissingMonths({
  username,
  previous,
  current,
  categoriesCol,
  session,
}) {
  let monthIndex = previous.month + 1;
  let yearIndex = previous.year;

  if (monthIndex > 12) {
    monthIndex = 1;
    yearIndex += 1;
  }

  let currentMonth = current.month;
  let currentYear = current.year;

  // Runs from the previous month until the current month
  while (
    yearIndex < currentYear ||
    (yearIndex === currentYear && monthIndex <= currentMonth)
  ) {
    // Set last month's filters
    const previousMonth = monthIndex - 1 === 0 ? 12 : monthIndex - 1;
    const previousYear = monthIndex - 1 === 0 ? yearIndex - 1 : yearIndex;

    // Set the semi-annual month filters
    const semiAnnualMonth =
      monthIndex - 6 <= 0 ? monthIndex + 6 : monthIndex - 6;
    const semiAnnualYear = monthIndex - 6 <= 0 ? yearIndex - 1 : yearIndex;

    // Set the annual month filters
    const annualMonth = monthIndex;
    const annualYear = yearIndex - 1;

    // Get the non-fixed categories from last month and the fixed monthly, semi-annual and annual categories
    const previousCategories = await categoriesCol
      .aggregate(
        [
          {
            $match: {
              username,
              $or: [
                {
                  month: previousMonth,
                  year: previousYear,
                  frequency: { $nin: ["Semi-Annually", "Annually"] },
                },
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
            $project: {
              _id: 1,
              username: 1,
              month: 1,
              year: 1,
              name: 1,
              color: 1,
              budget: 1,
              actual: { $cond: ["$fixed", "$actual", 0] },
              fixed: 1,
              frequency: 1,
              parentCategoryId: 1,
              noDelete: 1,
              dueDate: 1,
            },
          },
          { $sort: { year: 1, month: 1 } },
        ],
        { session },
      )
      .toArray();

    if (previousCategories.length > 0) {
      // Tracks all the subcategories' parent category ids
      const parentCategoryIds = new Set();

      // Keep track of the current parent category's
      const existingParentIds = new Set();

      previousCategories.forEach((category) => {
        if (category.parentCategoryId) {
          // Add all subcategories' parent categories to the set
          parentCategoryIds.add(category.parentCategoryId.toString());
        } else {
          // Add all the parent categories to the set
          existingParentIds.add(category._id.toString());
        }
      });

      // Find the missing parent ids from semi-annual and annual months
      const missingParentIds = [...parentCategoryIds].filter(
        (categoryId) => !existingParentIds.has(categoryId),
      );

      // Get the old parent categories from the semi-annual and annual months
      const missingParentCategories = await categoriesCol
        .find(
          {
            _id: {
              $in: missingParentIds.map(
                (categoryId) => new ObjectId(categoryId),
              ),
            },
          },
          { session },
        )
        .toArray();

      // Combine both categories to be formatted
      const allCategories = [...previousCategories, ...missingParentCategories];

      const formattedParentCategories = [];

      // Loop through each parent category while holding on to its old _id
      allCategories.forEach((category) => {
        if (!category.parentCategoryId) {
          const formattedCategory = {
            oldId: category._id,
            username,
            month: monthIndex,
            year: yearIndex,
            name: category.name,
            color: category.color,
            fixed: category.fixed,
            budget: category.budget,
          };

          if (formattedCategory.fixed) {
            formattedCategory.frequency = category.frequency;
            formattedCategory.dueDate = category.dueDate;
          }

          formattedParentCategories.push(formattedCategory);
        }
      });

      // Insert the new parent categories without the old _id
      const insertedParentCategories = await categoriesCol.insertMany(
        formattedParentCategories.map(({ oldId, ...category }) => category),
        { session },
      );

      const parentIdMap = new Map();

      // Map the old parent _id with then new _id
      formattedParentCategories.forEach((category, index) => {
        const oldId = category.oldId.toString();
        const newId = insertedParentCategories.insertedIds[index];

        parentIdMap.set(oldId, newId);
      });

      const subcategories = [];

      // Format the subcategories and attach their new parent id
      allCategories.forEach((category) => {
        if (category.parentCategoryId) {
          const newParentId = parentIdMap.get(
            category.parentCategoryId.toString(),
          );

          if (!newParentId) {
            return;
          }

          const formattedSubcategory = {
            username,
            month: monthIndex,
            year: yearIndex,
            parentCategoryId: newParentId,
            name: category.name,
            color: category.color,
            fixed: category.fixed,
            actual: category.fixed ? category.actual : 0,
          };

          if (formattedSubcategory.fixed) {
            formattedSubcategory.dueDate = category.dueDate;
            formattedSubcategory.frequency = category.frequency;
          }

          subcategories.push(formattedSubcategory);
        }
      });

      await categoriesCol.insertMany(subcategories, { session });

      // Update user's Fun Money category for the missing month
      await updateFunMoney({
        username,
        month: monthIndex,
        year: yearIndex,
        session,
      });
    }

    monthIndex += 1;

    if (monthIndex > 12) {
      monthIndex = 1;
      yearIndex += 1;
    }
  }
}
