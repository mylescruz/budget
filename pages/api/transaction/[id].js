// API Endpoint for a user's transactions data

import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  const method = req?.method;
  const id = req?.query?.id;

  // Configure MongoDB
  const mongoDB = process.env.MONGO_DB;
  const client = await clientPromise;
  const db = client.db(mongoDB);
  const transactionsCol = db.collection("transactions");

  if (method === "GET") {
    try {
      const doc = await transactionsCol.findOne({ _id: new ObjectId(id) });

      // If a user tries to directly access a different user's data, send an error message
      if (session.user.username !== doc.username) {
        return res.status(401).send("Access denied to this user's data");
      }

      const { _id, transaction } = doc;

      // Send the transaction back to the client
      res.status(200).json({ id: _id.toString(), ...transaction });
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res
        .status(500)
        .send(`Error occurred while getting ${username}'s transactions`);
    }
  } else if (method === "PUT") {
    try {
      const edittedTransaction = req?.body;

      const result = await transactionsCol.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            date: edittedTransaction.date,
            store: edittedTransaction.store,
            items: edittedTransaction.items,
            category: edittedTransaction.category,
            amount: edittedTransaction.amount,
          },
        }
      );

      if (result.modifiedCount === 1) {
        // Send the editted transaction back to the client
        res.status(200).json(edittedTransaction);
      } else {
        // Send an error message back to the client
        return res.status(404).send("Transaction not found");
      }
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res.status(500).send("Error occurred while editting a transaction");
    }
  } else if (method === "DELETE") {
    // Delete the given transaction from the user's transactions in S3
    try {
      const result = await transactionsCol.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 1) {
        // Send a succes message back to the client
        res.status(200).json({ id: id, message: "Transaction was deleted" });
      } else {
        // Send an error message back to the client
        return res.status(404).send("Transaction not found");
      }
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res.status(500).send("Error occurred while deleting a transaction");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
