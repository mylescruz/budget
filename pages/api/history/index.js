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

  const username = session.user.username;

  const method = req?.method;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const categoriesCol = db.collection("categories");
  const paychecksCol = db.collection("paychecks");

  // Function to get a user's history data from MongoDB
  const getHistory = async () => {
    const actual = await categoriesCol
      .aggregate([
        { $match: { username: username } },
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
      ])
      .toArray();

    const budget = await paychecksCol
      .aggregate([
        { $match: { username: username } },
        { $project: { month: 1, year: 1, net: 1 } },
        {
          $group: {
            _id: { month: "$month", year: "$year" },
            totalNet: { $sum: "$net" },
          },
        },
        {
          $project: {
            month: "$_id.month",
            year: "$_id.year",
            budget: "$totalNet",
            _id: 0,
          },
        },
        { $sort: { year: 1, month: 1 } },
      ])
      .toArray();

    let history = [];
    if (budget.length >= actual.length) {
      for (let i = 0; i < actual.length; i++) {
        if (
          budget[i].month === actual[i].month &&
          budget[i].year === actual[i].year
        ) {
          history.push({
            month: budget[i].month,
            year: budget[i].year,
            budget: budget[i].budget / 100,
            actual: actual[i].actual / 100,
            leftover: (budget[i].budget - actual[i].actual) / 100,
          });
        }
      }
    } else {
      throw new Error(
        "Invalid history pull. The budget and actual months do not line up."
      );
    }

    return history;
  };

  if (method === "GET") {
    try {
      const history = await getHistory();

      // Send the history array back to the client
      res.status(200).json(history);
    } catch (error) {
      console.error(`${method} history request failed: ${error}`);
      res
        .status(500)
        .send(`Error occurred while getting ${username}'s history`);
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
