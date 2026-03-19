import centsToDollars from "@/helpers/centsToDollars";
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

    // Get the current month's parent categories
    const currentParentDocs = await categoriesCol
      .find(
        { username, month, year, parentCategoryId: { $exists: false } },
        { name: 1, _id: 0 },
      )
      .toArray();

    // Get the names of all current parent categories
    const currentParentNames = currentParentDocs.map(
      (category) => category.name,
    );

    // Get all the user's parent categories that aren't in the current month
    const previousParentCategories = await categoriesCol
      .find({
        username,
        parentCategoryId: { $exists: false },
        name: { $nin: currentParentNames },
      })
      .toArray();

    // Map their ids
    const previousParentIds = previousParentCategories.map(
      (category) => category._id,
    );

    // Fetch all the previous subcategories that aren't in the current month
    const previousSubcategories = await categoriesCol
      .find({
        username,
        parentCategoryId: { $in: previousParentIds },
      })
      .toArray();

    // Map the previous subcategories to their relating parentCategoryIds
    const subcategoryMap = new Map();

    previousSubcategories.forEach((subcategory) => {
      const parentId = subcategory.parentCategoryId.toString();

      if (!subcategoryMap.has(parentId)) {
        subcategoryMap.set(parentId, []);
      }

      subcategoryMap.get(parentId).push(subcategory);
    });

    // Create a map of the previous categories based on their name
    const previousCategoriesMap = new Map();

    previousParentCategories.forEach((category) => {
      const foundParent = previousCategoriesMap.get(category.name);

      const formattedCategory = {
        name: category.name,
        color: category.color,
        fixed: category.fixed,
        budget: centsToDollars(category.budget),
        actual: 0,
        subcategories: [],
      };

      if (formattedCategory.fixed) {
        formattedCategory.actual = category.actual;
        formattedCategory.frequency = category.frequency;
        formattedCategory.dueDate = category.dueDate ?? 1;
      }

      if (!foundParent) {
        previousCategoriesMap.set(category.name, formattedCategory);
      }
    });

    // Loop through each parent and add their subcategories to the parent in the map
    previousParentCategories.forEach((category) => {
      const parentCategory = previousCategoriesMap.get(category.name);
      const subcategories = subcategoryMap.get(category._id.toString()) || [];

      // If the subcategory doesn't exist, format and add it to the parent categories map
      subcategories.forEach((subcategory) => {
        const subcategoryExists = parentCategory.subcategories.find(
          (sub) => sub.name === subcategory.name,
        );

        if (!subcategoryExists) {
          const formattedSubcategory = {
            _id: subcategory._id,
            name: subcategory.name,
            budget: 0,
          };

          if (parentCategory.fixed) {
            formattedSubcategory.budget = centsToDollars(subcategory.budget);
            formattedSubcategory.frequency = subcategory.frequency;
            formattedSubcategory.dueDate = subcategory.dueDate ?? 1;
          }

          parentCategory.subcategories.push(formattedSubcategory);
        }
      });
    });

    // Format the actual field to USD to send back to the client
    const previousCategories = [...previousCategoriesMap.values()].map(
      (category) => {
        return {
          ...category,
          actual: centsToDollars(category.actual),
        };
      },
    );

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
