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
  const historyCol = db.collection("history");

  // Function to get a user's history data from MongoDB
  const getHistory = async () => {
    const docs = await historyCol.find({ username: username }).toArray();

    const history = docs.map((mth) => {
      return {
        id: mth._id,
        month: mth.month,
        year: mth.year,
        budget: mth.budget,
        actual: mth.actual,
        leftover: mth.leftover,
      };
    });

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
  } else if (method === "POST") {
    // Add the new month to the user's history in S3
    try {
      const historyBody = req?.body;

      // Assign the identifier to the history
      const newHistory = {
        username: username,
        ...historyBody,
      };

      // Add the new history month to the history collection in MongoDB
      const result = await historyCol.insertOne(newHistory);

      // Send the new history object back to the client
      res.status(200).json({ id: result.insertedId, ...historyBody });
    } catch (error) {
      console.error(`${method} history request failed: ${error}`);
      res.status(500).send("Error occurred while adding to the history");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
