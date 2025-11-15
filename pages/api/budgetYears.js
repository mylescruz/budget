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

  const budgetYearsContext = {
    categoriesCol: db.collection("categories"),
    username: session.user.username,
  };

  switch (req.method) {
    case "GET":
      return getBudgetYears(res, budgetYearsContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Get the distinct years in a user's budget
async function getBudgetYears(res, { categoriesCol, username }) {
  try {
    const years = await categoriesCol.distinct("year", { username });

    return res.status(200).json({
      years: years.sort((a, b) => a - b),
      current: new Date().getFullYear(),
      max: Math.max(...years),
      min: Math.min(...years),
    });
  } catch (error) {
    console.error(`GET budget years request failed for ${username}: ${error}`);
    return res.status(500).send(`Error getting budget years for ${username}`);
  }
}
