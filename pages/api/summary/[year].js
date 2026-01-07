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
    const categories = await getCategoriesSummary(
      categoriesCol,
      username,
      year
    );

    const income = await getIncomeSummary(incomeCol, username, year);

    const transactions = await getAllTransactions(
      transactionsCol,
      username,
      year
    );

    const months = await getMonthsSummaries(categoriesCol, username, year);

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

            if (subcategoryActual !== 0) {
              // Add the subcategory's actual to the actual value in the categoriesSummary array
              categoriesSummary[categoryIndex].subcategories[
                foundSubcategoryIndex
              ].actual = subcategory.actual + subcategoryActual;

              categoriesSummary[categoryIndex].subcategories[
                foundSubcategoryIndex
              ].totalMonths += 1;
            }
          } else {
            if (subcategory.actual !== 0) {
              // If the subcategory is not in the categoriesSummary array, add it
              categoriesSummary[categoryIndex].subcategories.push({
                ...subcategory,
                totalMonths: 1,
              });
            }
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
      const updatedSubcategories = category.subcategories
        .filter((subcategory) => subcategory.actual !== 0)
        .map((subcategory) => {
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
        remaining: centsToDollars(category.budget - category.actual),
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

// Get total spending for each month
async function getMonthsSummaries(categoriesCol, username, year) {
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

// Get all the user's transactions for a given year
async function getAllTransactions(transactionsCol, username, year) {
  return await transactionsCol
    .aggregate([
      { $match: { username, year } },
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
