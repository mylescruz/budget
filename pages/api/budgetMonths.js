import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  // Configure NextAuth.js
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).send("Must be logged in to view your data");
  }

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);

  const budgetMonthsContext = {
    categoriesCol: db.collection("categories"),
    username: session.user.username,
  };

  switch (req.method) {
    case "GET":
      return getBudgetMonths(res, budgetMonthsContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Get all the months in a user's budget
async function getBudgetMonths(res, { categoriesCol, username }) {
  try {
    const months = await categoriesCol
      .aggregate([
        { $match: { username } },
        {
          $group: {
            _id: { month: "$month", year: "$year" },
          },
        },
        {
          $project: {
            month: "$_id.month",
            year: "$_id.year",
            _id: 0,
          },
        },
        { $sort: { year: 1, month: 1 } },
      ])
      .toArray();

    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();

    const budgetMonths = {
      current: {
        month: currentMonth,
        year: currentYear,
      },
      max: {
        month: 12,
        year: currentYear,
      },
      min: {
        month: months[0].month,
        year: months[0].year,
      },
    };

    return res.status(200).json(budgetMonths);
  } catch (error) {
    console.error(`GET budget months request failed for ${username}: ${error}`);
    return res.status(500).send(`Error getting budget months for ${username}`);
  }
}
