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
async function getCategories(
  req,
  res,
  { client, categoriesCol, transactionsCol, username },
) {
  const mongoSession = client.startSession();

  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    let categories = [];

    await mongoSession.withTransaction(async (session) => {
      categories = await getCurrentCategories(
        username,
        month,
        year,
        categoriesCol,
        transactionsCol,
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

    // Have the return object return the added category as well as any fixed transactions
    const addedCategoryObject = {
      addedCategory,
    };

    // Format the fixed transactions to return back to the client
    if (fixedTransactions.length > 0) {
      addedCategoryObject.fixedTransactions = fixedTransactions.map(
        (transaction, index) => {
          return {
            ...transaction,
            _id: insertedTransactions.insertedIds[index],
            amount: centsToDollars(transaction.amount),
            category: transaction.store,
          };
        },
      );
    }

    return res.status(200).json(addedCategoryObject);
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
  transactionsCol,
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

  // If the categories don't exist, fetch the last budget month's categories
  if (categoriesDocs.length === 0) {
    return await getPreviousCategories(
      username,
      month,
      year,
      categoriesCol,
      transactionsCol,
      session,
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

// If the categories for the current month and year don't exist, get the categories from the last populated month
async function getPreviousCategories(
  username,
  month,
  year,
  categoriesCol,
  transactionsCol,
  session,
) {
  const latestCategories = await categoriesCol
    .aggregate(
      [
        {
          $match: {
            username: username,
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

  if (latestCategories.length === 0) {
    throw new Error("User has no previous categories");
  }

  // Define the previous month and year
  const { month: previousMonth, year: previousYear } = latestCategories[0];

  // Create the missing category months
  await generateMissingMonths({
    username,
    previous: { month: previousMonth, year: previousYear },
    current: { month: month, year: year },
    categoriesCol,
    transactionsCol,
    session,
  });

  // Refetch the newly created categories
  return await getCurrentCategories(
    username,
    month,
    year,
    categoriesCol,
    transactionsCol,
    session,
  );
}

// Creates the missing category months from the latest month to the current month
async function generateMissingMonths({
  username,
  previous,
  current,
  categoriesCol,
  transactionsCol,
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

      const insertedSubcategoriesIds = await categoriesCol.insertMany(
        formattedSubcategories,
        {
          session,
          maxTimeMS: 10000,
        },
      );

      // Map the new subcategories' inserted ids to the correlating subcategory
      const insertedSubcategories = formattedSubcategories.map(
        (subcategory, index) => {
          return {
            ...subcategory,
            _id: insertedSubcategoriesIds.insertedIds[index],
          };
        },
      );

      // Array to store the fixed category and subcategory expense transactions
      const fixedTransactions = [];

      // If a category or subcategory has a due date, create a transaction for the category
      [...insertedParentCategories, ...insertedSubcategories].forEach(
        (category) => {
          if (category.fixed) {
            if (category.dueDate) {
              const date = new Date(
                yearIndex,
                monthIndex - 1,
                category.dueDate,
              );

              const currentTS = new Date();

              const newTransaction = {
                username: category.username,
                month: monthIndex,
                year: yearIndex,
                type: TRANSACTION_TYPES.EXPENSE,
                date: date,
                fixed: true,
                store: category.name,
                items: `Fixed expense occuring ${category.frequency.toLowerCase()}`,
                categoryId: category._id,
                amount: category.budget,
                createdTS: currentTS,
                updatedTS: currentTS,
              };

              // Add the parent category's _id for easier querying
              if (category.parentCategoryId) {
                newTransaction.parentCategoryId = category.parentCategoryId;
              }

              fixedTransactions.push(newTransaction);
            }
          }
        },
      );

      // Insert the fixed transactions for the month
      await transactionsCol.insertMany(fixedTransactions, {
        session,
        maxTimeMS: 5000,
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
