import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export default async function handler(req, res) {
  // Use NextAuth to authenticate a user's session
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).send(`Must login to view your data!`);
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const previousCategoriesContext = {
    categoriesCol: db.collection("categories"),
    username: session.user.username,
  };

  switch (req.method) {
    case "GET":
      return getPreviousCategories(req, res, previousCategoriesContext);
    default:
      return res.status(405).send(`Method ${req.method} is not allowed`);
  }
}

// Get the user's categories that aren't in their current month's budget
async function getPreviousCategories(req, res, { categoriesCol, username }) {
  try {
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);

    // Get the current month's categories
    const currentCategoriesDocs = await categoriesCol
      .find({ username, month, year }, { name: 1, _id: 0 })
      .toArray();

    const currentCategories = currentCategoriesDocs.map(
      (category) => category.name,
    );

    // Get all user's categories that aren't in the current month
    const allCategories = await categoriesCol
      .find({ username, name: { $nin: currentCategories } })
      .toArray();

    const previousCategoriesMap = new Map();

    // Map the categories based on their name into a final formatted object
    allCategories.forEach((category) => {
      const exists = previousCategoriesMap.get(category.name);

      if (!exists) {
        const formattedCategory = {
          name: category.name,
          color: category.color,
          budget: category.budget,
          actual: 0,
          fixed: category.fixed,
        };

        if (formattedCategory.fixed) {
          formattedCategory.actual = category.actual;
          formattedCategory.frequency = category.frequency;
          formattedCategory.dueDate = category.dueDate;
        }

        formattedCategory.subcategories = category.subcategories.map(
          (subcategory) => {
            const formattedSubcategory = {
              name: subcategory.name,
              actual: 0,
            };

            if (category.fixed) {
              formattedSubcategory.actual = subcategory.actual;
              formattedSubcategory.frequency = subcategory.frequency;
              formattedSubcategory.dueDate = subcategory.dueDate ?? 1;
            }

            return formattedSubcategory;
          },
        );

        previousCategoriesMap.set(category.name, formattedCategory);
      } else {
        // If the category is already in the map, just add the subcategories to the item
        category.subcategories.forEach((subcategory) => {
          if (
            !exists.subcategories.find((sub) => sub.name === subcategory.name)
          ) {
            const formattedSubcategory = {
              name: subcategory.name,
              actual: 0,
            };

            if (category.fixed) {
              formattedSubcategory.actual = subcategory.actual;
              formattedSubcategory.frequency = subcategory.frequency;
              formattedSubcategory.dueDate = subcategory.dueDate ?? 1;
            }

            exists.subcategories.push(formattedSubcategory);
          }
        });
      }
    });

    const previousCategories = [...previousCategoriesMap.values()];

    return res.status(200).json(previousCategories);
  } catch (error) {
    console.error(
      `GET previous categories request failed for ${username}: ${error}`,
    );
    return res
      .status(500)
      .send(
        `An error occurred while getting the previous categories for ${username}`,
      );
  }
}
