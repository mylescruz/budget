// API Endpoint for a user's history data

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  const username = session.user.username;

  const method = req?.method;
  const id = req?.query?.id;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const historyCol = db.collection("history");

  if (method === "PUT") {
    // Update a user's history for a given month in S3
    try {
      const edittedHistory = req?.body;

      // Update the history object in MongoDB
      await historyCol.updateOne(
        { _id: new ObjectId(id), username: username },
        {
          $set: {
            budget: edittedHistory.budget,
            actual: edittedHistory.actual,
            leftover: edittedHistory.leftover,
          },
        }
      );

      // Send the updated history object back to the client
      res.status(200).json(edittedHistory);
    } catch (error) {
      console.error(`${method} history request failed: ${error}`);
      res.status(500).send("Error occurred while editting the history");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
