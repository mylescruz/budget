// API Endpoint for a user's categories data

import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import { FUN_MONEY } from "@/lib/constants/categories";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";
import { logError } from "@/lib/logError";
import clientPromise from "@/lib/mongodb";
import { updateFunMoney } from "@/lib/updateFunMoney";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const categoriesContext = {
    client: client,
    categoriesCol: db.collection("categories"),
    transactionsCol: db.collection("transactions"),
    username: session.user.username,
  };

  switch (req.method) {
    case "GET":
      return getCategories(req, res, categoriesContext);
    case "POST":
      return addCategory(req, res, categoriesContext);
    default:
      return res.status(405).send(`${req.method} method not allowed`);
  }
}

// Get the user's categories from MongoDB
async function getCategories(req, res, { client, categoriesCol, username }) {
  const mongoSession = client.startSession();

  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    let categories;

    await mongoSession.withTransaction(async (session) => {
      // Fetch and format the user's categories
      categories = await getCurrentCategories(
        username,
        month,
        year,
        categoriesCol,
        session,
      );
    });

    return res.status(200).json(categories);
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to load your categories at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}

// Add a new category for the user in MongoDB
async function addCategory(
  req,
  res,
  { client, categoriesCol, transactionsCol, username },
) {
  const mongoSession = client.startSession();

  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    const newCategory = { ...req.body };

    let categoryBudget = 0;

    const newSubcategories = [];

    if (newCategory.subcategories.length === 0) {
      // Convert the budget value to cents
      categoryBudget = dollarsToCents(newCategory.budget);
    } else {
      if (!newCategory.fixed) {
        categoryBudget = dollarsToCents(newCategory.budget);
      }

      // Format each subcategory to be added to the database
      newCategory.subcategories.forEach((subcategory) => {
        const formattedSubcategory = {
          username,
          month,
          year,
          name: subcategory.name.trim(),
          color: newCategory.color,
          fixed: newCategory.fixed,
        };

        if (newCategory.fixed) {
          const subcategoryBudget = dollarsToCents(subcategory.budget);

          // Increment the parent category's budget field
          categoryBudget += subcategoryBudget;

          // Define the fixed fields
          formattedSubcategory.budget = subcategoryBudget;
          formattedSubcategory.frequency = subcategory.frequency;
          formattedSubcategory.dueDate = parseInt(subcategory.dueDate);
        }

        newSubcategories.push(formattedSubcategory);
      });
    }

    // Format the new category for the database
    const formattedCategory = {
      username,
      month,
      year,
      name: newCategory.name.trim(),
      color: newCategory.color,
      budget: categoryBudget,
      fixed: newCategory.fixed,
    };

    // A fixed category or subcategory date will pop up as a transaction on the budget's calendar
    if (formattedCategory.fixed) {
      if (newSubcategories.length === 0) {
        formattedCategory.frequency = newCategory.frequency;
        formattedCategory.dueDate = parseInt(newCategory.dueDate);
      }
    }

    let insertedCategory;
    let insertedSubcategories;

    // If the category or subcategories are fixed, create fixed transaction(s)
    const fixedTransactions = [];
    let insertedTransactions;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      insertedCategory = await categoriesCol.insertOne(formattedCategory, {
        session,
        maxTimeMS: 10000,
      });

      if (newSubcategories.length > 0) {
        // Map the parent category _id to each subcategory
        const formattedSubcategories = newSubcategories.map((subcategory) => {
          return {
            ...subcategory,
            parentCategoryId: insertedCategory.insertedId,
          };
        });

        insertedSubcategories = await categoriesCol.insertMany(
          formattedSubcategories,
          { session, maxTimeMS: 10000 },
        );
      }

      if (formattedCategory.fixed) {
        if (newSubcategories.length === 0) {
          // For a category with no subcategories, automatically insert a transaction for the new fixed category
          const date = new Date(year, month - 1, formattedCategory.dueDate);

          const currentTS = new Date();

          const newTransaction = {
            username,
            month,
            year,
            type: TRANSACTION_TYPES.EXPENSE,
            date: date,
            fixed: true,
            store: formattedCategory.name,
            items: `Fixed expense occuring ${formattedCategory.frequency.toLowerCase()}`,
            categoryId: insertedCategory.insertedId,
            amount: formattedCategory.budget,
            createdTS: currentTS,
            updatedTS: currentTS,
          };

          fixedTransactions.push(newTransaction);
        } else {
          // For a category with subcategories, insert a transaction for each fixed subcategory
          newSubcategories.forEach((subcategory, index) => {
            const date = new Date(year, month - 1, subcategory.dueDate);

            const currentTS = new Date();

            const newTransaction = {
              username,
              month,
              year,
              type: TRANSACTION_TYPES.EXPENSE,
              date: date,
              fixed: true,
              store: subcategory.name,
              items: `Fixed expense occuring ${subcategory.frequency.toLowerCase()}`,
              categoryId: insertedSubcategories.insertedIds[index],
              parentCategoryId: insertedCategory.insertedId,
              amount: subcategory.budget,
              createdTS: currentTS,
              updatedTS: currentTS,
            };

            fixedTransactions.push(newTransaction);
          });
        }

        // Insert the fixed category or subcategories transaction(s) into the database
        insertedTransactions = await transactionsCol.insertMany(
          fixedTransactions,
          {
            session,
            maxTimeMS: 5000,
          },
        );
      }

      await updateFunMoney({ username, month, year, session });
    });

    const today = new Date();

    let categoryActual = 0;

    const addedSubcategories = [];

    if (newSubcategories.length > 0) {
      // Add the inserted _id to each subcategory and format the budget and actual values to be sent back to the client
      newSubcategories.forEach((subcategory, index) => {
        const formattedSubcategory = {
          _id: insertedSubcategories.insertedIds[index],
          name: subcategory.name,
          fixed: subcategory.fixed,
        };

        if (subcategory.fixed) {
          formattedSubcategory.budget = centsToDollars(subcategory.budget);
          formattedSubcategory.frequency = subcategory.frequency;
          formattedSubcategory.dueDate = subcategory.dueDate;

          const subcategoryDate = new Date(
            `${month}/${subcategory.dueDate}/${year}`,
          );

          if (subcategoryDate <= today) {
            // Charge a fixed parent's actual value to the total if their charge date already passed
            formattedSubcategory.actual = formattedSubcategory.budget;
          } else {
            formattedSubcategory.actual = 0;
          }
        } else {
          formattedSubcategory.actual = 0;
        }

        categoryActual += dollarsToCents(formattedSubcategory.actual);

        addedSubcategories.push(formattedSubcategory);
      });
    } else {
      // Charge a fixed category's actual value if their charge date already passed
      const categoryDate = new Date(
        `${month}/${formattedCategory.dueDate}/${year}`,
      );

      if (categoryDate <= today) {
        categoryActual += formattedCategory.budget;
      }
    }

    // Send the new category back to the client
    const addedCategory = {
      _id: insertedCategory.insertedId,
      name: formattedCategory.name,
      color: formattedCategory.color,
      fixed: formattedCategory.fixed,
      budget: centsToDollars(formattedCategory.budget),
      actual: formattedCategory.fixed ? centsToDollars(categoryActual) : 0,
      subcategories: addedSubcategories,
    };

    if (addedCategory.fixed) {
      addedCategory.frequency = formattedCategory.frequency;
      addedCategory.dueDate = formattedCategory.dueDate;
    }

    // Format the fixed transactions to return back to the client
    if (fixedTransactions.length > 0) {
      addedCategory.fixedTransactions = fixedTransactions.map(
        (transaction, index) => {
          return {
            ...transaction,
            _id: insertedTransactions.insertedIds[index],
            amount: centsToDollars(transaction.amount),
            category: transaction.store,
            color: addedCategory.color,
          };
        },
      );
    }

    return res.status(200).json(addedCategory);
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to add this category at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}

async function getCurrentCategories(
  username,
  month,
  year,
  categoriesCol,
  session,
) {
  // Fetch all the user's categories for the given month and year with the sum of each category's correlating transaction amounts
  const categoriesDocs = await categoriesCol
    .aggregate(
      [
        { $match: { username, month, year } },
        {
          $lookup: {
            from: "transactions",
            localField: "_id",
            foreignField: "categoryId",
            pipeline: [
              {
                $match: {
                  username,
                  month,
                  year,
                  type: TRANSACTION_TYPES.EXPENSE,
                },
              },
              { $project: { categoryId: 1, amount: 1 } },
            ],
            as: "transactions",
          },
        },
        {
          $addFields: {
            transactionsAmount: { $sum: "$transactions.amount" },
          },
        },
        {
          $project: {
            transactions: 0,
          },
        },
      ],
      { session, maxTimeMS: 10000 },
    )
    .toArray();

  // If the categories don't exist, throw an error
  if (categoriesDocs.length === 0) {
    throw new Error(
      `${username} does not have categories for ${month}/${year}`,
    );
  }

  // Create a map object to place the subcategories with the correlating parent category
  const categoriesMap = new Map();

  // Filter the parent and subcategories
  const parentCategories = [];
  const subcategories = [];

  categoriesDocs.forEach((category) => {
    if (!category.parentCategoryId) {
      parentCategories.push(category);
    } else {
      subcategories.push(category);
    }
  });

  // Used for fixed categories to determine if their actual value has been charged yet
  const today = new Date();

  // Format each parent category
  parentCategories.forEach((category) => {
    const formattedCategory = {
      _id: category._id,
      username: category.username,
      month: category.month,
      year: category.year,
      name: category.name,
      color: category.color,
      fixed: category.fixed,
      budget: category.budget,
      subcategories: [],
    };

    if (formattedCategory.fixed) {
      formattedCategory.frequency = category.frequency;
      formattedCategory.dueDate = category.dueDate;

      if (category.dueDate) {
        const categoryDate = new Date(`${month}/${category.dueDate}/${year}`);

        if (categoryDate <= today) {
          // Charge a fixed parent's transaction amount if their due date already passed
          formattedCategory.actual = category.transactionsAmount;
        } else {
          // Apply no charge if their charge date hasn't passed
          formattedCategory.actual = 0;
        }
      } else {
        // A fixed parent with subcategories has no dueDate and therefore, set the actual value to 0 to sum the subcategories
        formattedCategory.actual = 0;
      }
    } else {
      // A non-fixed parent's value should be equal to the sum of their transactions
      formattedCategory.actual = category.transactionsAmount;
    }

    // Add the noDelete flag to the Fun Money category
    if (formattedCategory.name === FUN_MONEY) {
      formattedCategory.noDelete = true;
    }

    categoriesMap.set(category._id.toString(), formattedCategory);
  });

  // Format each subcategory and place it in the parent category's subcategories array
  subcategories.forEach((subcategory) => {
    const formattedSubcategory = {
      _id: subcategory._id,
      name: subcategory.name,
      fixed: subcategory.fixed,
      parentCategoryId: subcategory.parentCategoryId,
    };

    if (formattedSubcategory.fixed) {
      formattedSubcategory.budget = subcategory.budget;
      formattedSubcategory.frequency = subcategory.frequency;
      formattedSubcategory.dueDate = subcategory.dueDate;

      const subcategoryDate = new Date(
        `${month}/${subcategory.dueDate}/${year}`,
      );

      if (subcategoryDate <= today) {
        // Charge a fixed subcategory's transaction amount if their due date already passed
        formattedSubcategory.actual = subcategory.transactionsAmount;
      } else {
        formattedSubcategory.actual = 0;
      }
    } else {
      formattedSubcategory.actual = subcategory.transactionsAmount;
    }

    const foundParent = categoriesMap.get(
      subcategory.parentCategoryId.toString(),
    );

    if (foundParent) {
      foundParent.actual += formattedSubcategory.actual;

      // Format the subcategory's budget and actual value to be sent back to the client in USD
      formattedSubcategory.actual = centsToDollars(formattedSubcategory.actual);

      if (formattedSubcategory.fixed) {
        formattedSubcategory.budget = centsToDollars(
          formattedSubcategory.budget,
        );
      }

      // Embed the subcategory in the parent category
      foundParent.subcategories.push(formattedSubcategory);
    }
  });

  // Format the category's budget and actual values to be sent back to the client in USD
  // Sort the subcategories by due date and the categories by budget
  const categories = [...categoriesMap.values()]
    .map((category) => {
      return {
        ...category,
        budget: centsToDollars(category.budget),
        actual: centsToDollars(category.actual),
        subcategories: category.subcategories.sort(
          (a, b) => a.dueDate - b.dueDate,
        ),
      };
    })
    .sort((a, b) => b.budget - a.budget);

  return categories;
}
