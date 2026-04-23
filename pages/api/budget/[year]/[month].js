import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { logError } from "@/lib/logError";
import { updateFunMoney } from "@/lib/updateFunMoney";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";
import { FUN_MONEY } from "@/lib/constants/categories";
import centsToDollars from "@/helpers/centsToDollars";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const authSession = await getServerSession(req, res, authOptions);

  // Throw an error if a user tries to get budget data without having a session
  if (!authSession) {
    return res.status(401).send("Must login to view your data!");
  }

  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const budgetContext = {
    client,
    username: authSession.user.username,
    month: parseInt(req.query.month),
    year: parseInt(req.query.year),
    categoriesCol: db.collection("categories"),
    transactionsCol: db.collection("transactions"),
  };

  switch (req.method) {
    case "GET":
      return getBudget(req, res, budgetContext);
    default:
      return res.status(405).send(`${req.method} method not allowed`);
  }
}

async function getBudget(
  req,
  res,
  { client, username, month, year, categoriesCol, transactionsCol },
) {
  const mongoSession = client.startSession();

  let categories;
  let transactions;

  try {
    await mongoSession.withTransaction(async (session) => {
      // Make sure a user's categories exist for the given month
      await ensureCategoriesExist({
        username,
        month,
        year,
        categoriesCol,
        session,
      });

      // Make sure a user's transactions exist for the given month
      await ensureFixedTransactionsExist({
        username,
        month,
        year,
        transactionsCol,
        categoriesCol,
        session,
      });

      categories = await getCategories({
        username,
        month,
        year,
        categoriesCol,
        session,
      });

      transactions = await getTransactions({
        username,
        month,
        year,
        transactionsCol,
        session,
      });
    });

    return res.status(200).json({ categories, transactions });
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "There was a problem getting your budget for the month. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}

// Fetch all the user's categories for the given month and year with the sum of each category's correlating transaction amounts
async function getCategories({
  username,
  month,
  year,
  categoriesCol,
  session,
}) {
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
              {
                $match: {
                  username,
                  month,
                  year,
                  type: TRANSACTION_TYPES.EXPENSE,
                },
              },
              { $project: { categoryId: 1, amount: 1 } },
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
      { session, maxTimeMS: 10000 },
    )
    .toArray();

  // If the categories don't exist, throw an error
  if (categoriesDocs.length === 0) {
    throw new Error(
      `${username} does not have categories for ${month}/${year}`,
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
          // Charge a fixed parent's transaction amount if their due date already passed
          formattedCategory.actual = category.transactionsAmount;
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
    if (formattedCategory.name === FUN_MONEY) {
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
      parentCategoryId: subcategory.parentCategoryId,
    };

    if (formattedSubcategory.fixed) {
      formattedSubcategory.budget = subcategory.budget;
      formattedSubcategory.frequency = subcategory.frequency;
      formattedSubcategory.dueDate = subcategory.dueDate;

      const subcategoryDate = new Date(
        `${month}/${subcategory.dueDate}/${year}`,
      );

      if (subcategoryDate <= today) {
        // Charge a fixed subcategory's transaction amount if their due date already passed
        formattedSubcategory.actual = subcategory.transactionsAmount;
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

// Fetch all the user's transactions for the given month and year with the correlating category's details
async function getTransactions({
  username,
  month,
  year,
  transactionsCol,
  session,
}) {
  return await transactionsCol
    .aggregate(
      [
        {
          $match: {
            username,
            month,
            year,
          },
        },
        {
          $project: {
            type: 1,
            date: 1,
            store: 1,
            items: 1,
            categoryId: 1,
            fromAccount: 1,
            toAccount: 1,
            source: 1,
            incomeType: 1,
            description: 1,
            amount: { $divide: ["$amount", 100] },
            createdTS: 1,
            updatedTS: 1,
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "transactionCategory",
          },
        },
        {
          $addFields: {
            category: { $arrayElemAt: ["$transactionCategory.name", 0] },
            color: { $arrayElemAt: ["$transactionCategory.color", 0] },
            fixed: { $arrayElemAt: ["$transactionCategory.fixed", 0] },
            parentCategoryId: {
              $arrayElemAt: ["$transactionCategory.parentCategoryId", 0],
            },
          },
        },
        {
          $project: { transactionCategory: 0 },
        },
        { $sort: { date: 1, createdTS: 1 } },
      ],
      { session, maxTimeMS: 10000 },
    )
    .toArray();
}

// Check if the current month's categories exist in the database
async function ensureCategoriesExist({
  username,
  month,
  year,
  categoriesCol,
  session,
}) {
  // Count the number of documents for the month
  const categoryDocs = await categoriesCol.countDocuments(
    { username, month, year },
    { session, maxTimeMS: 5000 },
  );

  if (categoryDocs === 0) {
    // Get the user's last budget month and year
    const lastBudget = await getLastBudgetMonth({
      username,
      month,
      year,
      categoriesCol,
      session,
    });

    // Create the missing category months
    await generateMissingCategories({
      username,
      previous: { month: lastBudget.month, year: lastBudget.year },
      current: { month: month, year: year },
      categoriesCol,
      session,
    });
  }
}

// Find the last month and year of categories in the user's account
async function getLastBudgetMonth({
  username,
  month,
  year,
  categoriesCol,
  session,
}) {
  const lastBudget = await categoriesCol
    .aggregate(
      [
        {
          $match: {
            username,
            $or: [
              { year: { $lt: year } },
              { year: year, month: { $lt: month } },
            ],
          },
        },
        { $project: { month: 1, year: 1, _id: 0 } },
        { $sort: { year: -1, month: -1 } },
        { $limit: 1 },
      ],
      { session, maxTimeMS: 10000 },
    )
    .toArray();

  if (lastBudget.length === 0) {
    throw new Error("User has no previous categories");
  }

  return { month: lastBudget[0].month, year: lastBudget[0].year };
}

// Creates the missing category months from the latest month to the current month
async function generateMissingCategories({
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
        { session, maxTimeMS: 10000 },
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
          { session, maxTimeMS: 10000 },
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
      const insertedParentIds = await categoriesCol.insertMany(
        formattedParentCategories.map(({ oldId, ...category }) => category),
        { session, maxTimeMS: 10000 },
      );

      // Map the new parent categories' inserted ids to the correlating parent category
      const insertedParentCategories = formattedParentCategories.map(
        (category, index) => {
          return {
            ...category,
            _id: insertedParentIds.insertedIds[index],
          };
        },
      );

      // Map the old parent _id with the new _id
      const parentIdMap = new Map();

      insertedParentCategories.forEach((category) => {
        const oldId = category.oldId.toString();

        parentIdMap.set(oldId, category._id);
      });

      // Format the subcategories and attach their new parent id
      const formattedSubcategories = [];

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
            budget: category.fixed ? category.budget : 0,
          };

          if (formattedSubcategory.fixed) {
            formattedSubcategory.dueDate = category.dueDate;
            formattedSubcategory.frequency = category.frequency;
          }

          formattedSubcategories.push(formattedSubcategory);
        }
      });

      // Insert the formatted subcategories
      await categoriesCol.insertMany(formattedSubcategories, {
        session,
        maxTimeMS: 10000,
      });

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

// Check if the current month has fixed transactions correlating to the fixed categories for the month
async function ensureFixedTransactionsExist({
  username,
  month,
  year,
  transactionsCol,
  categoriesCol,
  session,
}) {
  // Count the number of documents for the month
  const transactionDocs = await transactionsCol.countDocuments(
    { username, month, year, fixed: true },
    { session, maxTimeMS: 5000 },
  );

  if (transactionDocs === 0) {
    // Creates the fixed transactions for the given month if they don't currently exist
    const fixedCategories = await categoriesCol
      .find(
        { username, month, year, fixed: true, dueDate: { $ne: null } },
        { session, maxTimeMS: 5000 },
      )
      .toArray();

    // Array to store the fixed category and subcategory expense transactions
    const fixedTransactions = [];

    // If a category or subcategory has a due date, create a transaction for the category
    fixedCategories.forEach((category) => {
      const date = new Date(year, month - 1, category.dueDate);

      const currentTS = new Date();

      const newTransaction = {
        username,
        month,
        year,
        type: TRANSACTION_TYPES.EXPENSE,
        date: date,
        fixed: true,
        store: category.name,
        items: `Fixed expense occuring ${category.frequency.toLowerCase()}`,
        categoryId: category._id,
        amount: category.budget,
        createdTS: currentTS,
        updatedTS: currentTS,
      };

      // Add the parent category's _id for easier querying
      if (category.parentCategoryId) {
        newTransaction.parentCategoryId = category.parentCategoryId;
      }

      fixedTransactions.push(newTransaction);
    });

    // Insert the fixed transactions for the month
    await transactionsCol.insertMany(fixedTransactions, {
      session,
      maxTimeMS: 5000,
    });
  }
}
