// API endpoint to add a new user to the system

import dollarsToCents from "@/helpers/dollarsToCents";
import clientPromise from "@/lib/mongodb";
import { updateFunMoney } from "@/lib/updateFunMoney";

const funMoney = "Fun Money";

export default async function handler(req, res) {
  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const today = new Date();

  const onboardingContext = {
    client: client,
    usersCol: db.collection("users"),
    categoriesCol: db.collection("categories"),
    incomeCol: db.collection("income"),
    month: today.getUTCMonth() + 1,
    year: today.getFullYear(),
  };

  switch (req.method) {
    case "POST":
      return createAccount(req, res, onboardingContext);
    default:
      return res.status(405).send(`Method ${req.method} is not allowed`);
  }
}

async function createAccount(
  req,
  res,
  { client, usersCol, categoriesCol, incomeCol, month, year },
) {
  const mongoSession = client.startSession();

  try {
    const newUser = { ...req.body };

    let insertedUser;

    await mongoSession.withTransaction(async (session) => {
      const incomeSources = [];

      newUser.income.forEach((source) => {
        const sourceInfo = { ...source };

        const [sourceYear, sourceMonth, sourceDay] = sourceInfo.date
          .split("-")
          .map(Number);

        const formattedSource = {
          username: newUser.username,
          month: sourceMonth,
          year: sourceYear,
          type: source.type,
          date: source.date,
          name: source.name.trim(),
          description: source.description.trim(),
          amount: parseFloat(source.amount) * 100,
        };

        if (formattedSource.type === "Paycheck") {
          formattedSource.gross = parseFloat(source.gross) * 100;
          formattedSource.deductions =
            formattedSource.gross - formattedSource.amount;
        }

        if (formattedSource.type === "Unemployment") {
          formattedSource.name = "EDD";
        }

        if (formattedSource.type === "Paycheck" && sourceInfo.repeating) {
          let dateIndex = formattedSource.date;

          while (dateIndex <= sourceInfo.endRepeatDate) {
            const [year, month, day] = dateIndex.split("-").map(Number);
            const date = new Date(year, month - 1, day);

            const paycheckSource = {
              ...formattedSource,
              date: dateIndex,
              month: month,
            };

            incomeSources.push(paycheckSource);

            switch (sourceInfo.frequency) {
              case "Weekly":
                date.setDate(date.getDate() + 7);
                dateIndex = date.toLocaleDateString("en-CA");
                break;
              case "Bi-Weekly":
                date.setDate(date.getDate() + 14);
                dateIndex = date.toLocaleDateString("en-CA");
                break;
              case "Monthly":
                const nextDate = new Date(
                  date.getFullYear(),
                  date.getMonth() + 1,
                  day,
                );
                dateIndex = nextDate.toLocaleDateString("en-CA");
                break;
              default:
                throw new Error("Invalid repeating paycheck frequency");
            }
          }
        } else {
          incomeSources.push(formattedSource);
        }
      });

      await incomeCol.insertMany(incomeSources, { session });

      if (!newUser.customCategories) {
        // Assign the default categories to the user
        await addUserDefaultCategories({
          username: newUser.username,
          month,
          year,
          categoriesCol,
          session,
        });
      } else {
        // Insert the user's custom categories
        await createUserCategories({
          categories: newUser.categories,
          username: newUser.username,
          month,
          year,
          categoriesCol,
          session,
        });
      }

      // Update the Fun Money category's budget based on the user's income
      await updateFunMoney({
        username: newUser.username,
        month,
        year,
        session,
      });

      // Mark the onboarded flag as true
      insertedUser = await usersCol.updateOne(
        { username: newUser.username },
        {
          $set: {
            onboarded: true,
          },
        },
        { session },
      );
    });

    // Return the newly onboarded user
    res.status(200).json(insertedUser);
  } catch (error) {
    console.error(`POST onboarding request failed: ${error}`);
    res.status(500).send(`Error occured while onboarding this new user`);
  } finally {
    await mongoSession.endSession();
  }
}

// Fetch and assign the user the default parent and subcategories
async function addUserDefaultCategories({
  username,
  month,
  year,
  categoriesCol,
  session,
}) {
  // Fetch both the parent categories and subcategories
  const defaultCategories = await categoriesCol
    .aggregate(
      [
        { $match: { defaultCategory: true } },
        { $project: { defaultCategory: 0 } },
      ],
      { session },
    )
    .toArray();

  // Separate both types of categories
  const parentCategories = [];
  const subcategories = [];

  defaultCategories.forEach((category) => {
    const formattedCategory = {
      ...category,
      username,
      month,
      year,
    };

    if (category.parentCategoryId) {
      subcategories.push(formattedCategory);
    } else {
      parentCategories.push(formattedCategory);
    }
  });

  // Insert the parent categories while removing the old id
  const insertedParents = await categoriesCol.insertMany(
    parentCategories.map(({ _id, ...category }) => category),
    {
      session,
    },
  );

  // Map the old default category _id to the user's new parent categories' _ids
  const parentCategoryMap = new Map();

  parentCategories.forEach((category, index) => {
    parentCategoryMap.set(
      category._id.toString(),
      insertedParents.insertedIds[index],
    );
  });

  const formattedSubcategories = subcategories.map((subcategory) => {
    const { _id, ...formattedSubcategory } = subcategory;

    // Fetch the new parent category's _id
    const parentId = parentCategoryMap.get(
      subcategory.parentCategoryId.toString(),
    );

    return {
      ...formattedSubcategory,
      parentCategoryId: parentId,
    };
  });

  // Insert the parent categories to get their _id
  await categoriesCol.insertMany(formattedSubcategories, {
    session,
  });
}

// Format the user's custom parent and subcategories to add to the database
async function createUserCategories({
  categories,
  username,
  month,
  year,
  categoriesCol,
  session,
}) {
  // Format the user's custom categories
  for (const category of categories) {
    const formattedCategory = {
      username,
      month,
      year,
      name: category.name.trim(),
      color: category.color,
      fixed: category.fixed,
    };

    const subcategories = [];

    if (category.subcategories.length === 0) {
      formattedCategory.budget = dollarsToCents(category.budget);

      if (category.fixed) {
        formattedCategory.frequency = category.frequency;
        formattedCategory.dueDate = parseInt(category.dueDate);
      }
    } else {
      let subcategoriesBudget = 0;

      // Format each subcategory with the identifiers and make sure all values are formatted properly
      category.subcategories.forEach((subcategory) => {
        const formattedSubcategory = {
          username,
          month,
          year,
          name: subcategory.name.trim(),
          fixed: category.fixed,
        };

        // If fixed, get the total budget value of subcategories to set equal to the parent budget
        if (category.fixed) {
          const subcategoryBudget = dollarsToCents(subcategory.budget);

          formattedSubcategory.budget = subcategoryBudget;

          // Increment the parent category's budget based on the subcategory's budget value
          subcategoriesBudget += subcategoryBudget;

          formattedSubcategory.frequency = subcategory.frequency;
          formattedSubcategory.dueDate = parseInt(subcategory.dueDate);
        }

        subcategories.push(formattedSubcategory);
      });

      // Set the parent category's budget value equal to the total sum of the subcategories' budget value
      if (category.fixed) {
        formattedCategory.budget = subcategoriesBudget;
      }
    }

    // Give the no delete flag for the Fun Money category
    if (category.name === funMoney) {
      formattedCategory.noDelete = true;
    }

    const insertedCategory = await categoriesCol.insertOne(formattedCategory, {
      session,
    });

    // If there are subcategories, assign the category's _id to all the subcategories' parentCategoryId
    if (subcategories.length > 0) {
      const formattedSubcategories = subcategories.map((subcategory) => {
        return {
          ...subcategory,
          parentCategoryId: insertedCategory.insertedId,
        };
      });

      await categoriesCol.insertMany(formattedSubcategories, { session });
    }
  }
}
