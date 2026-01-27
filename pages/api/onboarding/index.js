// API endpoint to add a new user to the system

import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

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
      // Add the user's inputted income to MongoDB
      let monthIncome = 0;
      const income = newUser.income.map((source) => {
        const sourceDate = new Date(`${source.date}T00:00:00Z`);
        const sourceMonth = sourceDate.getUTCMonth() + 1;
        const sourceYear = sourceDate.getUTCFullYear();

        if (month === sourceMonth && year === sourceYear) {
          monthIncome += parseFloat(source.amount) * 100;
        }

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

        return formattedSource;
      });

      await incomeCol.insertMany(income, { session });

      // Define the user's categories
      let categories = [];
      if (newUser.customCategories) {
        categories = newUser.categories.map((category) => {
          const finalCategory = {
            username: newUser.username,
            month: month,
            year: year,
            name: category.name.trim(),
            color: category.color,
            fixed: category.fixed,
            subcategories: category.subcategories,
          };

          finalCategory.budget = parseFloat(category.budget) * 100;

          let subcategoriesActual = 0;
          if (category.subcategories.length > 0) {
            // Set all subcategory values to cents
            finalCategory.subcategories = category.subcategories.map(
              (subcategory) => {
                const subcategoryActual = parseFloat(subcategory.actual) * 100;

                if (category.fixed) {
                  subcategoriesActual += subcategoryActual;

                  return {
                    id: subcategory.id,
                    name: subcategory.name.trim(),
                    actual: subcategoryActual,
                    frequency: subcategory.frequency,
                    dueDate: parseInt(subcategory.dueDate),
                  };
                } else {
                  return {
                    id: subcategory.id,
                    name: subcategory.name.trim(),
                    actual: 0,
                  };
                }
              },
            );
          }

          if (category.fixed) {
            if (category.subcategories.length > 0) {
              finalCategory.budget = subcategoriesActual;
              finalCategory.actual = subcategoriesActual;
            } else {
              finalCategory.actual = finalCategory.budget;
            }
          } else {
            finalCategory.actual = 0;
          }

          if (category.fixed) {
            if (category.subcategories.length > 0) {
              finalCategory.frequency = null;
              finalCategory.dueDate = null;
            } else {
              finalCategory.frequency = category.frequency;
              finalCategory.dueDate = parseInt(category.dueDate);
            }
          }

          if (category.name === funMoney) {
            finalCategory.noDelete = true;
          }

          return finalCategory;
        });
      } else {
        categories = await getDefaultCategories(
          newUser.username,
          month,
          year,
          categoriesCol,
        );
      }

      // Get the budget sum to update current Fun Money
      let budgetTotal = 0;
      for (const category of categories) {
        if (category.name !== funMoney) {
          budgetTotal += category.budget;
        }
      }

      const funMoneyIndex = categories.findIndex(
        (category) => category.name === funMoney,
      );

      categories[funMoneyIndex].budget = monthIncome - budgetTotal;

      await categoriesCol.insertMany(categories, { session });

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

async function getDefaultCategories(username, month, year, categoriesCol) {
  const defaultCategories = await categoriesCol
    .find({ defaultCategory: true })
    .sort({ budget: 1 })
    .toArray();

  const usersCategories = defaultCategories.map((category) => {
    const finalCategory = {
      username,
      month,
      year,
      name: category.name,
      color: category.color,
      budget: category.budget,
      actual: category.actual,
      fixed: category.fixed,
      frequency: category.frequency,
      subcategories: category.subcategories,
    };

    if (category.subcategories.length > 0) {
      finalCategory.subcategories = category.subcategories.map(
        (subcategory) => {
          const finalSubcategory = {
            id: uuidv4(),
            name: subcategory.name,
            actual: subcategory.actual,
          };

          if (category.fixed) {
            finalSubcategory.frequency = subcategory.frequency;
            finalSubcategory.dueDate = subcategory.dueDate;
          }

          return finalSubcategory;
        },
      );
    }

    if (category.fixed) {
      finalCategory.frequency = category.frequency;
      finalCategory.dueDate = category.dueDate;
    }

    if (category.name === funMoney) {
      finalCategory.noDelete = true;
    }

    return finalCategory;
  });

  return usersCategories;
}
