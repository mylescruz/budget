// API endpoint to add a new user to the system

import clientPromise from "@/lib/mongodb";

// Configuring bcrypt for password encryption
const bcrypt = require("bcrypt");
const saltRounds = 10;

const USER_ROLE = "User";

const GUILT_FREE = "Guilt Free Spending";

export default async function handler(req, res) {
  const method = req?.method;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const usersCol = db.collection("users");
  const categoriesCol = db.collection("categories");
  const paychecksCol = db.collection("paychecks");

  // Define the current month and year
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const monthName = today.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });

  const createUser = async (newUser) => {
    // Encrypt the user's entered password by using bcrypt
    const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);

    // Assign a timestamp for when the user created their profile
    const createdDate = new Date().toUTCString();

    // Create an object with a user's information
    const userInfo = {
      name: newUser.name,
      email: newUser.email,
      username: newUser.username.toLowerCase(),
      password_hash: hashedPassword,
      role: USER_ROLE,
      onboarded: true,
      created_date: createdDate,
    };

    // Add the new user to MongoDB
    const result = await usersCol.insertOne(userInfo);

    // Remove the password from the user object
    const { password_hash, ...user } = userInfo;

    // Return the added user
    return { id: result.insertedId, ...user };
  };

  // Function to get the default categories from MongoDB
  const getDefaultCategories = async (username) => {
    // Get the default categories from MongoDB
    const defaultDocs = await categoriesCol
      .find({ defaultCategory: true })
      .sort({ budget: 1 })
      .toArray();

    // Add the identifiers to the default categories
    const categories = defaultDocs.map((category) => {
      return {
        username: username,
        month: month,
        year: year,
        name: category.name,
        color: category.color,
        budget: category.budget,
        actual: category.actual,
        fixed: category.fixed,
        hasSubcategory: category.hasSubcategory,
        subcategories: category.subcategories,
      };
    });

    return categories;
  };

  if (method === "POST") {
    try {
      const newUser = req?.body;

      // Add the user to MongoDB
      const insertedUser = await createUser(newUser);

      // Add the identifiers to the user's paychecks
      const paychecks = newUser.paychecks.map((paycheck) => {
        return {
          username: newUser.username,
          month: month,
          year: year,
          date: paycheck.date,
          company: paycheck.company,
          description: paycheck.description,
          gross: paycheck.gross * 100,
          taxes: paycheck.taxes * 100,
          net: paycheck.net * 100,
        };
      });

      // Add the user's paychecks in MongoDB
      await paychecksCol.insertMany(paychecks);

      // Get the user's income for the current month
      const userPaychecks = await paychecksCol
        .find({ username: newUser.username, month: month, year: year })
        .toArray();

      const monthIncome = userPaychecks.reduce(
        (sum, paycheck) => sum + paycheck.net,
        0
      );

      // Add new categories for the user in MongoDB
      let categories = [];
      if (newUser.customCategories) {
        // Add the users inputted categories in MongoDB
        categories = newUser.categories.map((category) => {
          // Set all subcategory values to cents
          const finalSubcategories = category.subcategories.map(
            (subcategory) => {
              return {
                ...subcategory,
                actual: subcategory.actual * 100,
              };
            }
          );

          // Set the budget values to cents
          return {
            ...category,
            budget: category.budget * 100,
            subcategories: finalSubcategories,
          };
        });
      } else {
        // Add the default categories for the user in MongoDB
        categories = await getDefaultCategories(newUser.username);
      }

      // Get the budget total for all categories
      const filteredBudget = categories
        .filter((category) => category.name !== GUILT_FREE)
        .reduce((sum, current) => sum + current.budget, 0);

      // Update the Guilt Free Spending category to adjust for the user's total income for the month minus the total budget
      const gfsIndex = categories.findIndex(
        (category) => category.name === GUILT_FREE
      );

      categories[gfsIndex].budget = monthIncome - filteredBudget;

      const finalCategories = categories.map((category) => {
        return {
          username: newUser.username,
          month: month,
          year: year,
          name: category.name,
          color: category.color,
          budget: category.budget,
          actual: category.actual,
          fixed: category.fixed,
          hasSubcategory: category.hasSubcategory,
          subcategories: category.subcategories,
        };
      });

      // Insert the updated categories in MongoDB
      await categoriesCol.insertMany(finalCategories);

      // Return the new user
      res.status(200).json(insertedUser);
    } catch (error) {
      console.error(`${method} onboarding request failed: ${error}`);
      res.status(500).send("There was an error onboarding this user");
    }
  } else {
    res.status(405).send(`Method ${method} is not allowed`);
  }
}
