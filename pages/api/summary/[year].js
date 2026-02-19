import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";

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

    const income = await getIncomeSummary(incomeCol, username, month, year);

    const transactions = await getAllTransactions(
      transactionsCol,
      username,
      month,
      year,
    );

    const months = await getMonthsSummaries(
      categoriesCol,
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
    console.error(`GET summary request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while getting the summary for ${username}`);
  }
}

// Get the total spent for each summary
async function getCategoriesSummary(categoriesCol, username, month, year) {
  const categories = await categoriesCol
    .find(
      { username, year, month: { $lte: month } },
      {
        projection: {
          name: 1,
          color: 1,
          budget: 1,
          actual: 1,
          fixed: 1,
          subcategories: 1,
        },
      },
    )
    .sort({ actual: -1 })
    .toArray();

  // Create a map to get the totals of each category related by name
  const categoriesMap = new Map();

  categories.forEach((category) => {
    const mappedCategory = categoriesMap.get(category.name);

    if (!mappedCategory) {
      // Create a map to get the totals of each subcategory related by name
      const subcategoriesMap = new Map();

      category.subcategories.forEach((subcategory) => {
        subcategoriesMap.set(subcategory.name, {
          name: subcategory.name,
          actual: subcategory.actual,
          totalMonths: 1,
        });
      });

      categoriesMap.set(category.name, {
        name: category.name,
        color: category.color,
        budget: category.budget,
        actual: category.actual,
        fixed: category.fixed,
        subcategoriesMap: subcategoriesMap,
        totalMonths: 1,
      });
    } else {
      category.subcategories.forEach((subcategory) => {
        const mappedSubcategory = mappedCategory.subcategoriesMap.get(
          subcategory.name,
        );

        if (!mappedSubcategory) {
          mappedCategory.subcategoriesMap.set(subcategory.name, {
            name: subcategory.name,
            actual: subcategory.actual,
            totalMonths: 1,
          });
        } else {
          // Increment the subcategory's values
          mappedCategory.subcategoriesMap.set(subcategory.name, {
            ...mappedSubcategory,
            actual: mappedSubcategory.actual + subcategory.actual,
            totalMonths: mappedSubcategory.totalMonths + 1,
          });
        }
      });

      // Increment the category's values
      categoriesMap.set(category.name, {
        ...mappedCategory,
        budget: mappedCategory.budget + category.budget,
        actual: mappedCategory.actual + category.actual,
        totalMonths: mappedCategory.totalMonths + 1,
      });
    }
  });

  // Format the final summary to be sent back to the frontend
  const finalCategories = [...categoriesMap.values()]
    .map((category) => {
      const subcategories = [...category.subcategoriesMap.values()].map(
        (subcategory) => {
          return {
            ...subcategory,
            actual: centsToDollars(subcategory.actual),
            average: centsToDollars(
              subcategory.actual / subcategory.totalMonths,
            ),
          };
        },
      );

      return {
        name: category.name,
        color: category.color,
        budget: centsToDollars(category.budget),
        actual: centsToDollars(category.actual),
        remaining: centsToDollars(category.budget - category.actual),
        average: centsToDollars(category.actual / category.totalMonths),
        totalMonths: category.totalMonths,
        fixed: category.fixed,
        subcategories: subcategories,
      };
    })
    .sort((a, b) => b.actual - a.actual);

  return finalCategories;
}

// Get the total sum of each type of income
async function getIncomeSummary(incomeCol, username, month, year) {
  const incomeTypes = await incomeCol
    .aggregate([
      { $match: { username, year, month: { $lte: month } } },
      {
        $group: {
          _id: "$type",
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
    ])
    .toArray();

  const totalIncome = {
    gross: 0,
    deductions: 0,
    amount: 0,
  };

  const types = incomeTypes.map((type) => {
    totalIncome.amount += type.amount;

    if (type.name === "Paycheck") {
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
async function getMonthsSummaries(categoriesCol, username, month, year) {
  const months = await categoriesCol
    .aggregate([
      { $match: { username, year, month: { $lte: month } } },
      {
        $group: {
          _id: "$month",
          totalBudget: { $sum: "$budget" },
          totalActual: { $sum: "$actual" },
        },
      },
      {
        $project: {
          number: "$_id",
          budget: "$totalBudget",
          actual: "$totalActual",
          remaining: { $subtract: ["$totalBudget", "$totalActual"] },
          _id: 0,
        },
      },
    ])
    .toArray();

  return months
    .map((month) => {
      const monthNumber = month.number;
      const monthDate = new Date(year, monthNumber - 1);
      const monthName = monthDate.toLocaleDateString("en-US", {
        month: "long",
      });

      return {
        ...month,
        name: monthName,
        budget: centsToDollars(month.budget),
        actual: centsToDollars(month.actual),
        remaining: centsToDollars(month.remaining),
      };
    })
    .sort((a, b) => a.number - b.number);
}

// Get all the user's transactions for a given year
async function getAllTransactions(transactionsCol, username, month, year) {
  return await transactionsCol
    .aggregate([
      { $match: { username, year, month: { $lte: month } } },
      {
        $project: {
          month: 1,
          date: 1,
          store: 1,
          items: 1,
          category: 1,
          amount: { $divide: ["$amount", 100] },
        },
      },
    ])
    .toArray();
}
