// API Endpoint for a user's income data

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  const username = session.user.username;

  const paycheckId = req?.query?.id;
  const method = req?.method;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const paychecksCol = db.collection("paychecks");

  if (method === "PUT") {
    try {
      const edittedPaycheck = req?.body;

      // Update the editted paycheck in MongoDB
      await paychecksCol.updateOne(
        { _id: new ObjectId(paycheckId), username: username },
        {
          $set: {
            date: edittedPaycheck.date,
            company: edittedPaycheck.company,
            description: edittedPaycheck.description,
            gross: edittedPaycheck.gross,
            taxes: edittedPaycheck.taxes,
            net: edittedPaycheck.net,
          },
        }
      );

      // Send the updated paycheck back to the client
      res.status(200).json(edittedPaycheck);
    } catch (error) {
      console.error(`${method} paycheck request failed: ${error}`);
      res.status(500).send("Error occurred while editting a paycheck");
    }
  } else if (method === "DELETE") {
    try {
      // Delete the given paycheck from MongoDB
      await paychecksCol.deleteOne({ _id: new ObjectId(paycheckId) });

      // Send a success message back to the client
      res
        .status(200)
        .json({ id: paycheckId, message: "Paycheck deleted successfully" });
    } catch (err) {
      console.error(`${method} paycheck request failed: ${err}`);
      res.status(500).send("Error occurred while deleting a paycheck");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
