// API Endpoint for an administrator to view the users

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { logError } from "@/lib/logError";

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

  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const usersContext = {
    client,
    username: session.user.username,
    usersCol: db.collection("users"),
    categoriesCol: db.collection("categories"),
    transactionsCol: db.collection("transactions"),
  };

  switch (req.method) {
    case "GET":
      return getUsers(req, res, usersContext);
    case "PUT":
      return updateUser(req, res, usersContext);
    case "DELETE":
      return deleteUser(req, res, usersContext);
    default:
      return res.status(405).send(`${req.method} method not allowed`);
  }
}

// Gets all the users in the system from MongoDB
async function getUsers(req, res, { username, usersCol }) {
  try {
    const users = await usersCol
      .aggregate(
        [
          {
            $project: {
              _id: 1,
              name: 1,
              username: 1,
              email: 1,
              role: 1,
              active: 1,
              createdTS: 1,
              lastLoginTS: 1,
              onboarded: 1,
            },
          },
          {
            $sort: { createdTS: -1 },
          },
        ],
        { maxTimeMS: 5000 },
      )
      .toArray();

    // Send the users array back to the client
    return res.status(200).json(users);
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to load the users at the moment. Please try again later!",
      );
  }
}

async function updateUser(req, res, { username, usersCol }) {
  try {
    const editedUser = req.body;

    await usersCol.updateOne(
      { _id: new ObjectId(editedUser._id) },
      {
        $set: {
          email: editedUser.email,
          role: editedUser.role,
        },
      },
    );

    return res.status(200).json(editedUser);
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to edit this user at the moment. Please try again later!",
      );
  }
}

async function deleteUser(
  req,
  res,
  { client, username, usersCol, categoriesCol, transactionsCol },
) {
  const mongoSession = client.startSession();

  try {
    const deletedId = req.body._id;
    const username = req.body.username;

    await mongoSession.withTransaction(async (session) => {
      // Delete the user's account from the database
      await usersCol.deleteOne({ _id: new ObjectId(deletedId) }, { session });

      // Delete the users documents from the categories collection
      await categoriesCol.deleteMany({ username }, { session });

      // Delete the users documents from the transactions collection
      await transactionsCol.deleteMany({ username }, { session });
    });

    // Send back the deleted user to the client
    return res.status(200).send("The user was deleted successfully!");
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to delete this user at the moment. Please try again later!",
      );
  }
}
