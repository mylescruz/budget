import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

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
  { categoriesCol, transactionsCol, username }
) {
  const year = parseInt(req.query.year);

  try {
    const categories = await getCategoriesSummary(
      categoriesCol,
      username,
      year
    );

    const months = await getMonthsStats(categoriesCol, username, year);

    const topStores = await getTopStores(transactionsCol, username, year);

    const allMonths = await categoriesCol.distinct("month", { username, year });

    // Send the year summary back to the client
    return res.status(200).json({
      categories,
      months,
      topStores,
      monthsLength: allMonths.length,
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
          actual: subcategory.actual / 100,
          average: subcategory.actual / subcategory.totalMonths / 100,
        };
      });

      return {
        ...category,
        budget: category.budget / 100,
        actual: category.actual / 100,
        average: category.actual / category.totalMonths / 100,
        subcategories: updatedSubcategories,
      };
    })
    .sort((a, b) => b.actual - a.actual);

  return finalSummary;
}

// Get the max, min and average amount spent for each month
async function getMonthsStats(categoriesCol, username, year) {
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
          month: "$_id",
          amount: { $divide: ["$totalSpent", 100] },
          _id: 0,
        },
      },
    ])
    .toArray();

  // Get the total spent for the year
  let totalSpent = 0;

  // Add the month name to each month
  const formattedMonths = months
    .map((month) => {
      totalSpent += month.amount;

      const monthNumber = month.month;
      const monthDate = new Date(year, monthNumber - 1);
      const monthName = monthDate.toLocaleDateString("en-US", {
        month: "long",
      });

      return {
        ...month,
        monthName,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return {
    max: formattedMonths[0],
    min: formattedMonths[formattedMonths.length - 1],
    avg: totalSpent / formattedMonths.length,
  };
}

// Get the top 10 spending stores for the year
async function getTopStores(transactionsCol, username, year) {
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
