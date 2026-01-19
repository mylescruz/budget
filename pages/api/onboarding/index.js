// API endpoint to add a new user to the system

import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

// Configuring bcrypt for password encryption
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const USER_ROLE = "User";

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
    const newUser = {
      ...req.body,
      username: req.body.username.toLowerCase().trim(),
    };

    let insertedUser;

    await mongoSession.withTransaction(async (session) => {
      // Add the user to MongoDB
      insertedUser = await createUser(newUser, session, usersCol);

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
          formattedSource.deductions = parseFloat(source.deductions) * 100;
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
                    dayOfMonth: parseInt(subcategory.dayOfMonth),
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
              finalCategory.dayOfMonth = null;
            } else {
              finalCategory.dayOfMonth = parseInt(category.dayOfMonth);
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
    });

    // Return the new user
    res.status(200).json(insertedUser);
  } catch (error) {
    console.error(`POST onboarding request failed: ${error}`);
    res.status(500).send(`Error occured while onboarding this new user`);
  }
}

async function createUser(newUser, session, usersCol) {
  // Encrypt the user's entered password by using bcrypt
  const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);

  const createdDate = new Date().toUTCString();

  const userInfo = {
    name: newUser.name.trim(),
    email: newUser.email.trim(),
    username: newUser.username,
    password_hash: hashedPassword,
    role: USER_ROLE,
    onboarded: true,
    created_date: createdDate,
  };

  // Add the new user to MongoDB
  const insertedUser = await usersCol.insertOne(userInfo, { session });

  // Remove the password from the user object
  const { password_hash, ...user } = userInfo;

  return { _id: insertedUser.insertedId, ...user };
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
            finalSubcategory.dayOfMonth = subcategory.dayOfMonth;
          }

          return finalSubcategory;
        },
      );
    }

    if (category.fixed) {
      finalCategory.dayOfMonth = category.dayOfMonth;
    }

    if (category.name === funMoney) {
      finalCategory.noDelete = true;
    }

    return finalCategory;
  });

  return usersCategories;
}
