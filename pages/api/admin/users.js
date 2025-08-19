// API Endpoint for an administrator to view the users

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

  // Reject a user if they are not an Administrator
  if (session.user.role !== "Administrator") {
    return res.status(403).send("You do not have access to this information");
  }

  const method = req?.method;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const usersCol = db.collection("users");

  // Gets all the users in the system from MongoDB
  const getUsers = async () => {
    const docs = await usersCol.find({}).sort({ created_date: -1 }).toArray();

    const users = docs.map((record) => {
      return {
        id: record._id,
        name: record.name,
        username: record.username,
        email: record.email,
        role: record.role,
        created_date: record.created_date,
        onboarded: record.onboarded,
      };
    });

    return users;
  };

  if (method === "GET") {
    try {
      const users = await getUsers();

      // Send the users array back to the client
      res.status(200).json(users);
    } catch (error) {
      console.error(`${method} users request failed: ${error}`);
      res
        .status(500)
        .send(
          "An error occurred while retrieving the users. Please try again later!"
        );
    }
  } else if (method === "PUT") {
    try {
      const edittedUser = req?.body;

      const result = await usersCol.updateOne(
        { _id: new ObjectId(edittedUser.id) },
        {
          $set: {
            email: edittedUser.email,
            role: edittedUser.role,
          },
        }
      );

      if (result.modifiedCount === 1) {
        // Send the updated user back to the client
        const updatedUser = await usersCol.findOne({
          _id: new ObjectId(edittedUser.id),
        });

        res.status(200).json(updatedUser);
      } else {
        // Send an error message back to the client
        return res.status(404).send("User not found");
      }
    } catch (error) {
      console.error(`${method} users request failed: ${error}`);
      res
        .status(500)
        .send(
          "An error occurred while editting the user. Please try again later!"
        );
    }
  } else if (method === "DELETE") {
    try {
      const deletedUser = req?.body;

      await usersCol.deleteOne({ _id: new ObjectId(deletedUser.id) });

      // Delete the users documents from the categories collection
      await db
        .collection("categories")
        .deleteMany({ username: deletedUser.username });

      // Delete the users documents from the transactions collection
      await db
        .collection("transactions")
        .deleteMany({ username: deletedUser.username });

      // Delete the users documents from the paychecks collection
      await db
        .collection("paychecks")
        .deleteMany({ username: deletedUser.username });

      // Delete the users documents from the history collection
      await db
        .collection("history")
        .deleteMany({ username: deletedUser.username });

      // Send back the deleted user to the client
      res.status(200).json({ id: deletedUser.id });
    } catch (error) {
      console.error(`${method} users request failed: ${error}`);
      res
        .status(500)
        .send(
          "An error occurred while deleting the user. Please try again later!"
        );
    }
  } else {
    res.status(405).send(`${method} method not allowed`);
  }
}
