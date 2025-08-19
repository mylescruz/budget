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

  const username = session.user.username;

  const method = req?.method;
  const year = parseInt(req?.query?.year);

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const categoriesCol = db.collection("categories");

  // Function to get all the categories for the given year
  const getCategories = async () => {
    const docs = await categoriesCol
      .find({ username: username, year: year })
      .sort({ budget: 1 })
      .toArray();

    const categories = docs.map((category) => {
      const { username, month, year, ...categoryBody } = category;

      return categoryBody;
    });

    return categories;
  };

  if (method === "GET") {
    try {
      const summary = [];

      // Get the categories for the given file
      const categories = await getCategories();

      categories.forEach((category) => {
        // Find the category based on the index
        const categoryIndex = summary.findIndex(
          (cat) => cat.name === category.name
        );

        if (categoryIndex !== -1) {
          const foundCategory = summary[categoryIndex];

          // Check if the category has subcategories
          if (category.hasSubcategory) {
            summary[categoryIndex].hasSubcategory = true;

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
          summary[categoryIndex].budget =
            foundCategory.budget + category.budget;
          summary[categoryIndex].actual =
            foundCategory.actual + category.actual;
        } else {
          summary.push(category);
        }
      });

      // Send the summary array back to the client
      res.status(200).json(summary);
    } catch (error) {
      console.error(`${method} summary request failed: ${error}`);
      res
        .status(500)
        .send("Error occurred while retrieving the user's summary");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
