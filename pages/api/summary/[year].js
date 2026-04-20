import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import centsToDollars from "@/helpers/centsToDollars";
import { INCOME_TYPES } from "@/lib/constants/income";
import {
  TRANSACTION_TYPES,
  TRANSFER_ACCOUNTS,
} from "@/lib/constants/transactions";
import { logError } from "@/lib/logError";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);

  const year = parseInt(req.query.year);

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Only show the current and previous months if getting the summary for the current year
  const queryMonth = year === currentYear ? currentMonth : 12;

  const summaryContext = {
    categoriesCol: db.collection("categories"),
    transactionsCol: db.collection("transactions"),
    incomeCol: db.collection("income"),
    username: session.user.username,
    month: queryMonth,
    year: year,
  };

  switch (req.method) {
    case "GET":
      return getYearSummary(req, res, summaryContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

async function getYearSummary(
  req,
  res,
  { categoriesCol, transactionsCol, incomeCol, username, month, year },
) {
  try {
    const categories = await getCategoriesSummary(
      categoriesCol,
      username,
      month,
      year,
    );

    const income = await getIncomeSummary(
      transactionsCol,
      username,
      month,
      year,
    );

    const transactions = await getTransactions(
      transactionsCol,
      username,
      month,
      year,
    );

    const months = await getMonthsSummaries(
      categoriesCol,
      transactionsCol,
      incomeCol,
      username,
      month,
      year,
    );

    // Send the year summary back to the client
    return res.status(200).json({
      categories,
      income,
      months,
      transactions,
      monthsLength: months.length,
    });
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        `We're unable to load your budget's summary for ${year}. Please try again later!`,
      );
  }
}

// Get the total spent for each summary
async function getCategoriesSummary(categoriesCol, username, month, year) {
  // Get all the user's categories for the year from MongoDB
  const allCategories = await categoriesCol
    .aggregate(
      [
        { $match: { username, year, month: { $lte: month } } },
        // Grab all transactions associated with each category
        {
          $lookup: {
            from: "transactions",
            localField: "_id",
            foreignField: "categoryId",
            pipeline: [
              { $match: { username, year, type: TRANSACTION_TYPES.EXPENSE } },
              {
                $group: {
                  _id: { categoryId: "$categoryId", month: "$month" },
                  totalAmount: { $sum: "$amount" },
                },
              },
              {
                $project: {
                  categoryId: "$_id.categoryId",
                  month: "$_id.month",
                  totalAmount: 1,
                },
              },
            ],
            as: "transactions",
          },
        },
        // Add the transactions' total to each category
        {
          $addFields: {
            transactionsAmount: { $sum: "$transactions.totalAmount" },
          },
        },
        {
          $project: {
            _id: 1,
            month: 1,
            year: 1,
            name: 1,
            color: 1,
            fixed: 1,
            budget: 1,
            actual: "$transactionsAmount",
            parentCategoryId: 1,
            noDelete: 1,
            dueDate: 1,
            frequency: 1,
          },
        },
      ],
      { maxTimeMS: 10000 },
    )
    .toArray();

  // Separate the different categories
  const categoriesMap = new Map();
  const subcategories = [];

  // Used to help the subcategories reference their parentCategoryId to the parent category's name
  const parentIdMap = new Map();

  // Map the parent categories based on the category's name
  allCategories.forEach((category) => {
    if (!category.parentCategoryId) {
      if (!categoriesMap.has(category.name)) {
        categoriesMap.set(category.name, {
          name: category.name,
          color: category.color,
          fixed: category.fixed,
          budget: 0,
          actual: 0,
          totalMonths: 0,
          subcategoriesMap: new Map(),
        });
      }

      // Increment the category's budget and actual fields
      const parent = categoriesMap.get(category.name);

      parent.budget += category.budget;

      const categoryActual = category.fixed ? category.budget : category.actual;
      parent.actual += categoryActual;

      parent.totalMonths += 1;

      // Map the category's _id to its name
      parentIdMap.set(category._id.toString(), category.name);
    } else {
      // Separate the subcategories into their own array
      subcategories.push(category);
    }
  });

  // Map the subcategories to the parent category using its name
  subcategories.forEach((category) => {
    const parentName = parentIdMap.get(category.parentCategoryId.toString());

    const parent = categoriesMap.get(parentName);

    if (!parent.subcategoriesMap.has(category.name)) {
      parent.subcategoriesMap.set(category.name, {
        name: category.name,
        fixed: category.fixed,
        actual: 0,
        totalMonths: 0,
      });
    }

    // Increment the parent category and subcategory's actual field
    const subcategory = parent.subcategoriesMap.get(category.name);

    const subcategoryActual = category.fixed
      ? category.budget
      : category.actual;

    subcategory.actual += subcategoryActual;
    parent.actual += subcategoryActual;

    subcategory.totalMonths += 1;
  });

  // Format the final categories
  const categories = [...categoriesMap.values()]
    .map((category) => {
      let categoryBudget = category.budget;
      let categoryActual = 0;

      const formattedSubcategories = [];

      // Format the subcategory objects
      [...category.subcategoriesMap.values()].forEach((subcategory) => {
        categoryActual += subcategory.actual;

        const formattedSubcategory = {
          name: subcategory.name,
          actual: centsToDollars(subcategory.actual),
          average: centsToDollars(subcategory.actual / subcategory.totalMonths),
          totalMonths: subcategory.totalMonths,
        };

        formattedSubcategories.push(formattedSubcategory);
      });

      // Set the category budget equal to the actual value for fixed categories
      if (formattedSubcategories.length > 0) {
        if (category.fixed) {
          categoryBudget = categoryActual;
        }
      } else {
        if (category.fixed) {
          categoryBudget = category.actual;
          categoryActual = category.actual;
        } else {
          categoryActual = category.actual;
        }
      }

      return {
        name: category.name,
        color: category.color,
        fixed: category.fixed,
        budget: centsToDollars(categoryBudget),
        actual: centsToDollars(categoryActual),
        remaining: centsToDollars(categoryBudget - categoryActual),
        average: centsToDollars(categoryActual / category.totalMonths),
        subcategories: formattedSubcategories,
        totalMonths: category.totalMonths,
      };
    })
    .sort((a, b) => b.actual - a.actual);

  return categories;
}

// Get the total sum of each type of income
async function getIncomeSummary(transactionsCol, username, month, year) {
  const incomeTypes = await transactionsCol
    .aggregate(
      [
        {
          $match: {
            username,
            year,
            month: { $lte: month },
            type: TRANSACTION_TYPES.INCOME,
          },
        },
        {
          $group: {
            _id: "$incomeType",
            totalGross: { $sum: "$gross" },
            totalDeductions: { $sum: "$deductions" },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $project: {
            name: "$_id",
            gross: "$totalGross",
            deductions: "$totalDeductions",
            amount: "$totalAmount",
            _id: 0,
          },
        },
        { $sort: { amount: -1 } },
      ],
      { maxTimeMS: 10000 },
    )
    .toArray();

  const totalIncome = {
    gross: 0,
    deductions: 0,
    amount: 0,
  };

  const types = incomeTypes.map((type) => {
    totalIncome.amount += type.amount;

    if (type.name === INCOME_TYPES.PAYCHECK) {
      totalIncome.gross = type.gross;
      totalIncome.deductions = type.deductions;

      return {
        name: type.name,
        gross: centsToDollars(type.gross),
        deductions: centsToDollars(type.deductions),
        amount: centsToDollars(type.amount),
      };
    } else {
      return {
        name: type.name,
        amount: centsToDollars(type.amount),
      };
    }
  });

  return {
    totalIncome: {
      gross: centsToDollars(totalIncome.gross),
      deductions: centsToDollars(totalIncome.deductions),
      amount: centsToDollars(totalIncome.amount),
    },
    types,
  };
}

// Get total spending for each month
async function getMonthsSummaries(
  categoriesCol,
  transactionsCol,
  incomeCol,
  username,
  month,
  year,
) {
  // Get the total fixed expenses for each month
  const allFixedCategories = await categoriesCol
    .aggregate(
      [
        { $match: { username, year, month: { $lte: month }, fixed: true } },
        {
          $project: {
            _id: 1,
            month: 1,
            name: 1,
            budget: 1,
            actual: 1,
            parentCategoryId: 1,
          },
        },
      ],
      { maxTimeMS: 5000 },
    )
    .toArray();

  // Separate the parent and subcategories
  const fixedParentCategoriesMap = new Map();
  const fixedSubcategories = [];

  allFixedCategories.forEach((category) => {
    if (!category.parentCategoryId) {
      fixedParentCategoriesMap.set(category._id.toString(), {
        ...category,
        originalActual: category.budget,
        actual: 0,
        subcategoriesCount: 0,
      });
    } else {
      fixedSubcategories.push(category);
    }
  });

  // Add each subcategory's actual value to the parent category's total
  fixedSubcategories.forEach((subcategory) => {
    const parent = fixedParentCategoriesMap.get(
      subcategory.parentCategoryId.toString(),
    );

    parent.subcategoriesCount += 1;

    parent.actual += subcategory.budget;
  });

  // Map through the categories to update the final actual total
  const fixedCategoriesPerMonth = [...fixedParentCategoriesMap.values()].map(
    (category) => {
      const formattedCategory = {
        number: category.month,
        actual: category.actual,
      };

      if (category.subcategoriesCount === 0) {
        formattedCategory.actual = category.originalActual;
      }

      return formattedCategory;
    },
  );

  // Get the total expenses per month based on type and transfers based on the account
  const expensesPerMonth = await transactionsCol
    .aggregate(
      [
        {
          $match: {
            username,
            year,
            month: { $lte: month },
            type: {
              $in: [TRANSACTION_TYPES.EXPENSE, TRANSACTION_TYPES.TRANSFER],
            },
          },
        },
        {
          $group: {
            _id: { month: "$month", type: "$type", toAccount: "$toAccount" },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $project: {
            number: "$_id.month",
            type: "$_id.type",
            toAccount: "$_id.toAccount",
            amount: "$totalAmount",
            _id: 0,
          },
        },
      ],
      { maxTimeMS: 10000 },
    )
    .toArray();

  // Get the total income per month
  const incomePerMonth = await transactionsCol
    .aggregate(
      [
        {
          $match: {
            username,
            year,
            month: { $lte: month },
            type: TRANSACTION_TYPES.INCOME,
          },
        },
        {
          $group: {
            _id: "$month",
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $project: {
            number: "$_id",
            amount: "$totalAmount",
            _id: 0,
          },
        },
      ],
      { maxTimeMS: 10000 },
    )
    .toArray();

  // Create a map to store each month's total income and expenses
  const monthsMap = new Map();

  // Map the fixed expenses to each month of the year
  fixedCategoriesPerMonth.forEach((month) => {
    const foundMonth = monthsMap.get(month.number);

    if (!foundMonth) {
      monthsMap.set(month.number, {
        number: month.number,
        income: 0,
        transfers: {
          in: 0,
          out: 0,
        },
        actual: month.actual,
      });
    } else {
      foundMonth.actual += month.actual;
    }
  });

  // Map the expenses to the actual values and transfers to each month of the year
  expensesPerMonth.forEach((month) => {
    const foundMonth = monthsMap.get(month.number);

    if (month.type === TRANSACTION_TYPES.EXPENSE) {
      foundMonth.actual += month.amount;
    }

    if (month.type === TRANSACTION_TYPES.TRANSFER) {
      if (month.toAccount === TRANSFER_ACCOUNTS.SAVINGS) {
        foundMonth.transfers.out += month.amount;
      } else {
        foundMonth.transfers.in += month.amount;
      }
    }
  });

  // Map each month's total income
  incomePerMonth.forEach((month) => {
    const foundMonth = monthsMap.get(month.number);

    foundMonth.income += month.amount;
  });

  return [...monthsMap.values()]
    .map((month) => {
      const monthNumber = month.number;
      const monthDate = new Date(year, monthNumber - 1);
      const monthName = monthDate.toLocaleDateString("en-US", {
        month: "long",
      });

      return {
        ...month,
        name: monthName,
        income: centsToDollars(month.income),
        actual: centsToDollars(month.actual),
        remaining: centsToDollars(month.income - month.actual),
        transfers: {
          in: centsToDollars(month.transfers.in),
          out: centsToDollars(month.transfers.out),
        },
      };
    })
    .sort((a, b) => a.number - b.number);
}

// Get all the user's transactions for a given year
async function getTransactions(transactionsCol, username, month, year) {
  return await transactionsCol
    .aggregate(
      [
        {
          $match: {
            username,
            year,
            month: { $lte: month },
            type: {
              $in: [TRANSACTION_TYPES.EXPENSE, TRANSACTION_TYPES.TRANSFER],
            },
          },
        },
        {
          $project: {
            type: 1,
            date: 1,
            createdTS: 1,
            store: 1,
            items: 1,
            categoryId: 1,
            fromAccount: 1,
            toAccount: 1,
            description: 1,
            amount: { $divide: ["$amount", 100] },
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
      { maxTimeMS: 10000 },
    )
    .toArray();
}
