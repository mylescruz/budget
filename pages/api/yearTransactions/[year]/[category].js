// API Endpoint for a user's transactions for a specific category for the year

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
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

  // Object with parameters used in HTTP methods
  const transactionsContext = {
    transactionsCol: db.collection("transactions"),
    username: session.user.username,
  };

  switch (req.method) {
    case "GET":
      return getYearTransactions(req, res, transactionsContext);
    default:
      return res.status(405).send(`${req.method} method not allowed`);
  }
}

// Get the user's transactions for the year in MongoDB
async function getYearTransactions(req, res, { transactionsCol, username }) {
  const year = parseInt(req.query.year);
  const category = req.query.category;

  try {
    // Get all transactions for given category
    const transactions = await transactionsCol
      .find(
        { username, year, category },
        { projection: { username: 0, month: 0, year: 0, category: 0, _id: 0 } }
      )
      .sort({ amount: -1 })
      .limit(10)
      .toArray();

    // Send the top 10 transactions back to the client
    return res.status(200).json(transactions);
  } catch (error) {
    console.error(
      `GET ${category} transactions request failed for ${username}: ${error}`
    );
    return res
      .status(500)
      .send(
        `Error occurred while getting the ${category} transactions for ${username}`
      );
  }
}
