// API Endpoint for a user's history data

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);

  const historyContext = {
    categoriesCol: db.collection("categories"),
    username: session.user.username,
  };

  switch (req.method) {
    case "GET":
      return getHistory(req, res, historyContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Function to get a user's history data from MongoDB
async function getHistory(req, res, { categoriesCol, username }) {
  const year = parseInt(req.query.year);

  try {
    const history = await categoriesCol
      .aggregate([
        { $match: { username, year } },
        { $project: { month: 1, year: 1, actual: 1 } },
        {
          $group: {
            _id: { month: "$month", year: "$year" },
            totalActual: { $sum: "$actual" },
          },
        },
        {
          $project: {
            month: "$_id.month",
            year: "$_id.year",
            actual: "$totalActual",
            _id: 0,
          },
        },
        { $sort: { year: 1, month: 1 } },
        {
          $lookup: {
            from: "paychecks",
            let: { year: "$year", month: "$month" },
            pipeline: [
              { $match: { username, year } },
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$year", "$$year"] },
                      { $eq: ["$month", "$$month"] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: { month: "$month", year: "$year" },
                  budget: { $sum: "$net" },
                },
              },
              { $sort: { year: 1, month: 1 } },
              {
                $project: {
                  month: "$_id.month",
                  year: "$_id.year",
                  budget: 1,
                  _id: 0,
                },
              },
            ],
            as: "budgets",
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [{ $arrayElemAt: ["$budgets", 0] }, "$$ROOT"],
            },
          },
        },
        {
          $project: {
            month: 1,
            year: 1,
            budget: { $divide: ["$budget", 100] },
            actual: { $divide: ["$actual", 100] },
            leftover: {
              $divide: [{ $subtract: ["$budget", "$actual"] }, 100],
            },
            budgets: 1,
          },
        },
        {
          $project: {
            budgets: 0,
          },
        },
      ])
      .toArray();

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getUTCMonth() + 1;

    let finalHistory = history;

    if (year === currentYear) {
      finalHistory = history.filter((month) => month.month !== currentMonth);
    }

    // Send the history for the year back to the client
    return res.status(200).json(finalHistory);
  } catch (error) {
    console.error(`GET history request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while getting history for ${username}`);
  }
}
