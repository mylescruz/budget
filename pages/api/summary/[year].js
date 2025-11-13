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
    username: session.user.username,
  };

  switch (req.method) {
    case "GET":
      return getYearSummary(req, res, summaryContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

async function getYearSummary(req, res, { categoriesCol, username }) {
  const year = parseInt(req.query.year);

  try {
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

    const summary = [];

    categories.forEach((category) => {
      // Find the category based on the index
      const categoryIndex = summary.findIndex(
        (cat) => cat.name === category.name
      );

      if (categoryIndex !== -1) {
        const foundCategory = summary[categoryIndex];

        // Check if the category has subcategories
        if (category.subcategories.length > 0) {
          // Create a set of subcategory names
          const subcategoryNames = new Set(
            foundCategory.subcategories.map((subcategory) => subcategory.name)
          );

          category.subcategories.forEach((subcategory) => {
            // Check a category's subcategory is already in the summary array
            if (subcategoryNames.has(subcategory.name.trim())) {
              const foundSubcategoryIndex =
                foundCategory.subcategories.findIndex(
                  (sub) => sub.name === subcategory.name
                );

              // Get the current actual value for the subcategory
              const subcategoryActual =
                foundCategory.subcategories[foundSubcategoryIndex].actual;

              // Add the subcategory's actual to the actual value in the summary array
              summary[categoryIndex].subcategories[
                foundSubcategoryIndex
              ].actual = subcategory.actual + subcategoryActual;
            } else {
              // If the subcategory is not in the summary array, add it
              summary[categoryIndex].subcategories.push(subcategory);
            }
          });
        }

        // Add the totals for the budget and the actual values to the summary array for that category
        summary[categoryIndex].budget = foundCategory.budget + category.budget;
        summary[categoryIndex].actual = foundCategory.actual + category.actual;

        summary[categoryIndex].subcategories.sort(
          (a, b) => b.actual - a.actual
        );
      } else {
        summary.push(category);
      }
    });

    // Send the year summary back to the client
    return res.status(200).json(summary);
  } catch (error) {
    console.error(`GET summary request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while getting the summary for ${username}`);
  }
}
