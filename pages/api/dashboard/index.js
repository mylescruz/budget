import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { logError } from "@/lib/logError";
import {
  TRANSACTION_TYPES,
  TRANSFER_ACCOUNTS,
} from "@/lib/constants/transactions";

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

  let categories;
  let totals;

  // Querying info
  const currentTS = new Date();
  const month = currentTS.getMonth() + 1;
  const year = currentTS.getFullYear();

  try {
    await mongoSession.withTransaction(async (session) => {
      // Get the user's categories that for the month
      categories = await categoriesCol
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
          ],
          { session, maxTimeMS: 5000 },
        )
        .toArray();

      let previousMonth = month - 1;
      let previousYear = year;

      if (previousMonth === 0) {
        previousMonth = 12;
        previousYear -= 1;
      }

      // Get the user's total income and expenses for the month
      const monthTotals = await transactionsCol
        .aggregate([
          {
            $match: {
              username,
              $or: [
                { month, year },
                { month: previousMonth, year: previousYear },
              ],
            },
          },
          {
            $group: {
              _id: { month: "$month", type: "$type", toAccount: "$toAccount" },
              amount: { $sum: "$amount" },
            },
          },
          {
            $project: {
              _id: 0,
              month: "$_id.month",
              type: "$_id.type",
              toAccount: "$_id.toAccount",
              amount: { $divide: ["$amount", 100] },
            },
          },
        ])
        .toArray();

      totals = {
        current: {
          number: month,
          income: 0,
          expenses: 0,
          transfersIn: 0,
          transfersOut: 0,
        },
        previous: {
          number: previousMonth,
          income: 0,
          expenses: 0,
          transfersIn: 0,
          transfersOut: 0,
        },
      };

      // Define the month's expenses and income to send back to the client
      monthTotals.forEach((total) => {
        const amount = total.amount;

        if (total.type === TRANSACTION_TYPES.EXPENSE) {
          if (total.month === month) {
            totals.current.expenses = amount;
          } else {
            totals.previous.expenses = amount;
          }
        } else if (total.type === TRANSACTION_TYPES.INCOME) {
          if (total.month === month) {
            totals.current.income = amount;
          } else {
            totals.previous.income = amount;
          }
        } else {
          if (total.month === month) {
            if (total.toAccount === TRANSFER_ACCOUNTS.CHECKING) {
              totals.current.transfersIn = amount;
            } else {
              totals.current.transfersOut = amount;
            }
          } else {
            if (total.toAccount === TRANSFER_ACCOUNTS.CHECKING) {
              totals.previous.transfersIn = amount;
            } else {
              totals.previous.transfersOut = amount;
            }
          }
        }
      });
    });

    return res.status(200).json({
      categories,
      totals,
    });
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
