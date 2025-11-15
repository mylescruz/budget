// API Endpoint for a user's information

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Configuring bcrypt for password encryption
const bcrypt = require("bcrypt");
const saltRounds = 10;

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("You must login to view this information");
  }

  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const userContext = {
    client: client,
    db: db,
    usersCol: db.collection("users"),
    username: session.user.username,
    _id: session.user._id,
  };

  switch (req.method) {
    case "GET":
      return getUser(res, userContext);
    case "PUT":
      return updateUser(req, res, userContext);
    case "DELETE":
      return deleteUser(req, res, userContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Function to get a user's information from MongoDB
async function getUser(res, { usersCol, username }) {
  try {
    const user = await usersCol.findOne({ username });

    // Return the user without their password
    const { password_hash, ...userInfo } = user;

    // Send the user back to the client
    return res.status(200).json(userInfo);
  } catch (error) {
    console.error(`GET user request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(
        "An error occurred while getting your account info. Please try again later!"
      );
  }
}

async function updateUser(req, res, { client, usersCol, username, _id }) {
  const mongoSession = client.startSession();

  try {
    const updatedUser = req.body;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      const storedUser = await usersCol.findOne({ username }, { session });

      // Check if the given password matches the stored password
      const passwordsMatch = await checkHashedPassword(
        updatedUser.currentPassword,
        storedUser.password_hash
      );

      if (!passwordsMatch) {
        return res
          .status(401)
          .send("Passwords do not match. Cannot update the user.");
      }

      let userPassword = storedUser.password_hash;
      let userEmail = storedUser.email;

      if ("newPassword" in updatedUser) {
        userPassword = await bcrypt.hash(updatedUser.newPassword, saltRounds);
      }

      if ("newEmail" in updatedUser) {
        userEmail = updatedUser.newEmail;
      }

      await usersCol.updateOne(
        { _id: new ObjectId(_id) },
        {
          $set: {
            email: userEmail,
            password_hash: userPassword,
          },
        },
        { session }
      );
    });

    // Return the user with the updated details
    const { currentPassword, newPassword, newEmail, ...user } = updatedUser;

    // Send the user back to the client
    return res.status(200).json(user);
  } catch (error) {
    console.error(`PUT user request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(
        "An error occurred while updating your account. Please try again later!"
      );
  } finally {
    await mongoSession.endSession();
  }
}

async function deleteUser(req, res, { client, db, usersCol, username, _id }) {
  const mongoSession = client.startSession();
  try {
    const deletedUser = req.body;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      const storedUser = await usersCol.findOne({ username }, { session });

      // Check if the given password matches the stored password
      const passwordsMatch = await checkHashedPassword(
        deletedUser.password,
        storedUser.password_hash
      );

      if (!passwordsMatch) {
        return res
          .status(401)
          .send("Passwords do not match. Cannot delete the user.");
      }

      // Delete the user from the users collection
      await usersCol.deleteOne({ _id: new ObjectId(_id) }, { session });

      // Delete the user's documents from the categories collection
      await db.collection("categories").deleteMany({ username }, { session });

      // Delete the user's documents from the transactions collection
      await db.collection("transactions").deleteMany({ username }, { session });

      // Delete the user's documents from the paychecks collection
      await db.collection("paychecks").deleteMany({ username }, { session });
    });

    // Send back a successful status that the user was deleted
    return res.status(200).send();
  } catch (error) {
    console.error(`DELETE user request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(
        "An error occurred while deleting your account. Please try again later!"
      );
  } finally {
    await mongoSession.endSession();
  }
}

// Function to compare the given password with the stored encrypted password
async function checkHashedPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords: ", error);
    return false;
  }
}
