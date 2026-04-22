import clientPromise from "./mongodb";
import { updateFunMoney } from "./updateFunMoney";

export default async function ensureCategoriesExist({
  username,
  month,
  year,
  session,
}) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const categoriesCol = db.collection("categories");

  // Check if categories exist
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
