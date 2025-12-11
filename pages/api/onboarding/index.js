// API endpoint to add a new user to the system

import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

// Configuring bcrypt for password encryption
const bcrypt = require("bcrypt");
const saltRounds = 10;

const USER_ROLE = "User";

const GUILT_FREE = "Guilt Free Spending";

export default async function handler(req, res) {
  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const today = new Date();

  const onboardingContext = {
    client: client,
    usersCol: db.collection("users"),
    categoriesCol: db.collection("categories"),
    paychecksCol: db.collection("paychecks"),
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
  { client, usersCol, categoriesCol, paychecksCol, month, year }
) {
  const mongoSession = client.startSession();

  try {
    const newUser = {
      ...req.body,
      username: req.body.username.toLowerCase(),
    };

    let insertedUser;

    await mongoSession.withTransaction(async (session) => {
      // Add the user to MongoDB
      insertedUser = await createUser(newUser, session, usersCol);

      // Add the user's inputted paychecks to MongoDB
      let monthIncome = 0;
      const paychecks = newUser.paychecks.map((paycheck) => {
        const paycheckDate = new Date(`${paycheck.date}T00:00:00Z`);
        const paycheckMonth = paycheckDate.getUTCMonth() + 1;
        const paycheckYear = paycheckDate.getUTCFullYear();

        if (month === paycheckMonth && year === paycheckYear) {
          monthIncome += paycheck.net * 100;
        }

        return {
          username: newUser.username,
          month: paycheckMonth,
          year: paycheckYear,
          date: paycheck.date,
          company: paycheck.company,
          description: paycheck.description,
          gross: paycheck.gross * 100,
          taxes: paycheck.taxes * 100,
          net: paycheck.net * 100,
        };
      });

      await paychecksCol.insertMany(paychecks, { session });

      // Define the user's categories
      let categories = [];
      if (newUser.customCategories) {
        categories = newUser.categories.map((category) => {
          const finalCategory = {
            username: newUser.username,
            month: month,
            year: year,
            name: category.name,
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
                    name: subcategory.name,
                    actual: subcategoryActual,
                    dayOfMonth: parseInt(subcategory.dayOfMonth),
                  };
                } else {
                  return {
                    id: subcategory.id,
                    name: subcategory.name,
                    actual: 0,
                  };
                }
              }
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

          if (category.name === GUILT_FREE) {
            finalCategory.noDelete = true;
          }

          return finalCategory;
        });
      } else {
        categories = await getDefaultCategories(
          newUser.username,
          month,
          year,
          categoriesCol
        );
      }

      // Get the budget sum to update current Guilt Free Spending
      let budgetTotal = 0;
      for (const category of categories) {
        if (category.name !== GUILT_FREE) {
          budgetTotal += category.budget;
        }
      }

      const guiltFreeIndex = categories.findIndex(
        (category) => category.name === GUILT_FREE
      );

      categories[guiltFreeIndex].budget = monthIncome - budgetTotal;

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
    name: newUser.name,
    email: newUser.email,
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
        }
      );
    }

    if (category.fixed) {
      finalCategory.dayOfMonth = category.dayOfMonth;
    }

    if (category.name === GUILT_FREE) {
      finalCategory.noDelete = true;
    }

    return finalCategory;
  });

  return usersCategories;
}
