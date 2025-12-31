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

  const summaryContext = {
    categoriesCol: db.collection("categories"),
    transactionsCol: db.collection("transactions"),
    incomeCol: db.collection("income"),
    username: session.user.username,
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
  { categoriesCol, transactionsCol, incomeCol, username }
) {
  const year = parseInt(req.query.year);

  try {
    const totals = await getYearTotals(
      categoriesCol,
      incomeCol,
      username,
      year
    );

    const categories = await getCategoriesSummary(
      categoriesCol,
      username,
      year
    );

    const income = await getIncomeSummary(incomeCol, username, year);

    const top10 = await getTop10s(
      categoriesCol,
      incomeCol,
      transactionsCol,
      username,
      year
    );

    const monthsSpending = await getMonthsSpending(
      categoriesCol,
      username,
      year
    );

    const allMonths = await categoriesCol.distinct("month", { username, year });

    // Send the year summary back to the client
    return res.status(200).json({
      totals,
      categories,
      income,
      monthsSpending,
      top10,
      monthsLength: allMonths.length,
    });
  } catch (error) {
    console.error(`GET summary request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while getting the summary for ${username}`);
  }
}

// Get the year totals
async function getYearTotals(categoriesCol, incomeCol, username, year) {
  // Get the total income for the year
  const income = await incomeCol
    .aggregate([
      { $match: { username, year } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      { $project: { _id: 0, totalAmount: 1 } },
    ])
    .toArray();

  const totalIncome = income[0].totalAmount;

  // Get the total spent for the year, highest month, lowest month and average month
  const months = await categoriesCol
    .aggregate([
      { $match: { username, year } },
      {
        $group: {
          _id: "$month",
          totalSpent: { $sum: "$actual" },
        },
      },
      {
        $project: {
          number: "$_id",
          amount: "$totalSpent",
          _id: 0,
        },
      },
    ])
    .toArray();

  // Get the total spent for the year
  let totalSpent = 0;

  // Add the month name to each month
  const allMonths = months
    .map((month) => {
      totalSpent += month.amount;

      const monthNumber = month.number;
      const monthDate = new Date(year, monthNumber - 1);
      const monthName = monthDate.toLocaleDateString("en-US", {
        month: "long",
      });

      return {
        ...month,
        amount: centsToDollars(month.amount),
        name: monthName,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const maxMonth = allMonths[0];
  const minMonth = allMonths[allMonths.length - 1];
  const avgMonth = centsToDollars(totalSpent / allMonths.length);

  const totalRemaining = totalIncome - totalSpent;

  return {
    income: centsToDollars(totalIncome),
    spent: centsToDollars(totalSpent),
    remaining: centsToDollars(totalRemaining),
    maxMonth,
    minMonth,
    avgMonth,
  };
}

// Get the total spent for each summary
async function getCategoriesSummary(categoriesCol, username, year) {
  const categories = await categoriesCol
    .find(
      { username, year },
      {
        projection: {
          name: 1,
          color: 1,
          budget: 1,
          actual: 1,
          fixed: 1,
          subcategories: 1,
        },
      }
    )
    .sort({ actual: -1 })
    .toArray();

  const categoriesSummary = [];

  categories.forEach((category) => {
    // Find the category based on the index
    const categoryIndex = categoriesSummary.findIndex(
      (cat) =>
        cat.name.toLowerCase().trim() === category.name.toLowerCase().trim()
    );

    if (categoryIndex !== -1) {
      const foundCategory = categoriesSummary[categoryIndex];

      // Check if the category has subcategories
      if (category.subcategories.length > 0) {
        // Create a set of subcategory names
        const subcategoryNames = new Set(
          foundCategory.subcategories.map((subcategory) =>
            subcategory.name.toLowerCase().trim()
          )
        );

        category.subcategories.forEach((subcategory) => {
          // Check a category's subcategory is already in the categoriesSummary array
          if (subcategoryNames.has(subcategory.name.toLowerCase().trim())) {
            const foundSubcategoryIndex = foundCategory.subcategories.findIndex(
              (sub) => sub.name === subcategory.name
            );

            // Get the current actual value for the subcategory
            const subcategoryActual =
              foundCategory.subcategories[foundSubcategoryIndex].actual;

            // Add the subcategory's actual to the actual value in the categoriesSummary array
            categoriesSummary[categoryIndex].subcategories[
              foundSubcategoryIndex
            ].actual = subcategory.actual + subcategoryActual;

            categoriesSummary[categoryIndex].subcategories[
              foundSubcategoryIndex
            ].totalMonths += 1;
          } else {
            // If the subcategory is not in the categoriesSummary array, add it
            categoriesSummary[categoryIndex].subcategories.push({
              ...subcategory,
              totalMonths: 1,
            });
          }
        });
      }

      // Add the totals for the budget and the actual values to the categoriesSummary array for that category
      categoriesSummary[categoryIndex].budget =
        foundCategory.budget + category.budget;
      categoriesSummary[categoryIndex].actual =
        foundCategory.actual + category.actual;
      categoriesSummary[categoryIndex].totalMonths += 1;

      categoriesSummary[categoryIndex].subcategories.sort(
        (a, b) => b.actual - a.actual
      );
    } else {
      const updatedSubcategories = category.subcategories.map((subcategory) => {
        return {
          ...subcategory,
          totalMonths: 1,
        };
      });
      categoriesSummary.push({
        ...category,
        totalMonths: 1,
        subcategories: updatedSubcategories,
      });
    }
  });

  const finalSummary = categoriesSummary
    .map((category) => {
      const updatedSubcategories = category.subcategories.map((subcategory) => {
        return {
          ...subcategory,
          actual: centsToDollars(subcategory.actual),
          average: centsToDollars(subcategory.actual / subcategory.totalMonths),
        };
      });

      return {
        ...category,
        budget: centsToDollars(category.budget),
        actual: centsToDollars(category.actual),
        average: centsToDollars(category.actual / category.totalMonths),
        subcategories: updatedSubcategories,
      };
    })
    .sort((a, b) => b.actual - a.actual);

  return finalSummary;
}

// Get the total sum of each type of income
async function getIncomeSummary(incomeCol, username, year) {
  const incomeTypes = await incomeCol
    .aggregate([
      { $match: { username, year } },
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

// Get all the top 10 for the year
async function getTop10s(
  categoriesCol,
  incomeCol,
  transactionsCol,
  username,
  year
) {
  const spendingMonths = await getTopSpendingMonths(
    categoriesCol,
    username,
    year
  );
  const spendingCategories = await getTopSpendingCategories(
    transactionsCol,
    username,
    year
  );
  const fixedCategories = await getTopFixedCategories(
    categoriesCol,
    username,
    year
  );
  const overSpendingCategories = await getTopOverSpendingCategories(
    categoriesCol,
    username,
    year
  );
  const storesSpent = await getTopSpentStores(transactionsCol, username, year);
  const storesVisited = await getTopFrequentedStores(
    transactionsCol,
    username,
    year
  );
  const transactions = await getTopTransactions(
    transactionsCol,
    username,
    year
  );

  const top10 = [
    { title: "Spending Months", data: spendingMonths },
    { title: "Changing Categories", data: spendingCategories },
    { title: "Fixed Categories", data: fixedCategories },
    { title: "Overspending Categories", data: overSpendingCategories },
    { title: "Stores Shopped", data: storesSpent },
    { title: "Stores Visited", data: storesVisited },
    { title: "Transactions", data: transactions },
  ];

  return top10;
}

// Get the top 10 spending stores for the year
async function getTopSpentStores(transactionsCol, username, year) {
  return await transactionsCol
    .aggregate([
      { $match: { username, year } },
      { $group: { _id: "$store", totalAmount: { $sum: "$amount" } } },
      {
        $project: {
          store: "$_id",
          amount: { $divide: ["$totalAmount", 100] },
          _id: 0,
        },
      },
      { $sort: { amount: -1 } },
      { $limit: 10 },
    ])
    .toArray();
}

// Get the top 10 stores frequented for the year
async function getTopFrequentedStores(transactionsCol, username, year) {
  return await transactionsCol
    .aggregate([
      { $match: { username, year } },
      { $group: { _id: "$store", visits: { $sum: 1 } } },
      {
        $project: {
          store: "$_id",
          visits: 1,
          _id: 0,
        },
      },
      { $sort: { visits: -1 } },
      { $limit: 10 },
    ])
    .toArray();
}

// Get the top 10 transactions for the year
async function getTopTransactions(transactionsCol, username, year) {
  return await transactionsCol
    .aggregate([
      { $match: { username, year } },
      {
        $project: {
          store: 1,
          items: 1,
          amount: { $divide: ["$amount", 100] },
          _id: 0,
        },
      },
      { $sort: { amount: -1 } },
      { $limit: 10 },
    ])
    .toArray();
}

// Get the top 10 spending categories for the year
async function getTopSpendingCategories(transactionsCol, username, year) {
  return await transactionsCol
    .aggregate([
      { $match: { username, year } },
      { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
      {
        $project: {
          name: "$_id",
          amount: { $divide: ["$totalAmount", 100] },
          _id: 0,
        },
      },
      { $sort: { amount: -1 } },
      { $limit: 10 },
    ])
    .toArray();
}

// Get the top 10 fixed categories for the year
async function getTopFixedCategories(categoriesCol, username, year) {
  return await categoriesCol
    .aggregate([
      { $match: { username, year, fixed: true } },
      { $group: { _id: "$name", totalAmount: { $sum: "$actual" } } },
      {
        $project: {
          name: "$_id",
          amount: { $divide: ["$totalAmount", 100] },
          _id: 0,
        },
      },
      { $sort: { amount: -1 } },
      { $limit: 10 },
    ])
    .toArray();
}

// Get the top 10 categories where the user overspent for the year
async function getTopOverSpendingCategories(categoriesCol, username, year) {
  return await categoriesCol
    .aggregate([
      { $match: { username, year } },
      {
        $group: {
          _id: "$name",
          totalBudget: { $sum: "$budget" },
          totalActual: { $sum: "$actual" },
        },
      },
      {
        $project: {
          name: "$_id",
          budget: { $divide: ["$totalBudget", 100] },
          actual: { $divide: ["$totalActual", 100] },
          remaining: {
            $divide: [{ $subtract: ["$totalBudget", "$totalActual"] }, 100],
          },
          _id: 0,
        },
      },
      { $match: { remaining: { $lt: 0 } } },
      { $sort: { remaining: 1 } },
      { $limit: 10 },
    ])
    .toArray();
}

// Get the top 10 spending months for the year
async function getTopSpendingMonths(categoriesCol, username, year) {
  const topMonths = await categoriesCol
    .aggregate([
      { $match: { username, year } },
      {
        $group: {
          _id: "$month",
          totalBudget: { $sum: "$budget" },
          totalSpent: { $sum: "$actual" },
        },
      },
      {
        $project: {
          number: "$_id",
          budget: { $divide: ["$totalBudget", 100] },
          spent: { $divide: ["$totalSpent", 100] },
          _id: 0,
        },
      },
      { $sort: { spent: -1 } },
      { $limit: 10 },
    ])
    .toArray();

  return topMonths
    .map((month) => {
      const monthNumber = month.number;
      const monthDate = new Date(year, monthNumber - 1);
      const monthName = monthDate.toLocaleDateString("en-US", {
        month: "long",
      });

      return {
        ...month,
        name: monthName,
      };
    })
    .sort((a, b) => b.spent - a.spent);
}

// Get total spending for each month
async function getMonthsSpending(categoriesCol, username, year) {
  const months = await categoriesCol
    .aggregate([
      { $match: { username, year } },
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
