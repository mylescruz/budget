import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { logError } from "@/lib/logError";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const authSession = await getServerSession(req, res, authOptions);

  // Throw an error if a user tries to get budget data without having a session
  if (!authSession) {
    return res.status(401).send("Must login to view your data!");
  }

  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const dashboardContext = {
    client,
    username: authSession.user.username,
    categoriesCol: db.collection("categories"),
    transactionsCol: db.collection("transactions"),
  };

  switch (req.method) {
    case "GET":
      return getDashboardInfo(req, res, dashboardContext);
    default:
      return res.status(404).send(`${req.method} is not allowed`);
  }
}

async function getDashboardInfo(
  req,
  res,
  { client, username, categoriesCol, transactionsCol },
) {
  const mongoSession = client.startSession();

  // Object to return to the client
  const dashboard = {
    top5Categories: null,
    monthExpenses: null,
    monthIncome: null,
  };

  // Querying info
  const currentTS = new Date();
  const month = currentTS.getMonth() + 1;
  const year = currentTS.getFullYear();

  try {
    await mongoSession.withTransaction(async (session) => {
      // Get the top 5 categories that a user has spent money on
      dashboard.top5Categories = await categoriesCol
        .aggregate(
          [
            {
              $match: {
                username,
                month,
                year,
              },
            },
            {
              $lookup: {
                from: "transactions",
                localField: "_id",
                foreignField: "categoryId",
                pipeline: [
                  { $match: { type: TRANSACTION_TYPES.EXPENSE } },
                  {
                    $group: {
                      _id: "$categoryId",
                      transactionsAmount: { $sum: "$amount" },
                    },
                  },
                ],
                as: "transactions",
              },
            },
            {
              $addFields: {
                actual: {
                  $arrayElemAt: ["$transactions.transactionsAmount", 0],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                color: 1,
                actual: { $divide: ["$actual", 100] },
              },
            },
            {
              $sort: { actual: -1 },
            },
            {
              $limit: 5,
            },
          ],
          { session, maxTimeMS: 5000 },
        )
        .toArray();

      // Get the user's total income and expenses for the month
      const totals = await transactionsCol
        .aggregate(
          [
            {
              $match: {
                username,
                month,
                year,
                type: {
                  $in: [TRANSACTION_TYPES.EXPENSE, TRANSACTION_TYPES.INCOME],
                },
              },
            },
            {
              $group: {
                _id: "$type",
                amount: { $sum: "$amount" },
              },
            },
            {
              $project: {
                type: "$_id",
                amount: { $divide: ["$amount", 100] },
                _id: 0,
              },
            },
          ],
          { session, maxTimeMS: 5000 },
        )
        .toArray();

      // Define the month's expenses and income to send back to the client
      totals.forEach((total) => {
        if (total.name === TRANSACTION_TYPES.EXPENSE) {
          dashboard.monthExpenses = total.amount;
        }

        if (total.name === TRANSACTION_TYPES.INCOME) {
          dashboard.monthIncome = total.amount;
        }
      });
    });

    return res.status(200).json(dashboard);
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "There was a problem loading your dashboard details. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}
