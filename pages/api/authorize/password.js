// API Endpoint to authorize a user's credentials

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const bcrypt = require("bcrypt");

export default async function handler(req, res) {
  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const usersContext = {
    client: client,
    usersCol: db.collection("users"),
  };

  switch (req.method) {
    case "POST":
      return verifyLogin(req, res, usersContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Verify given credentials with the credentials stored in MongoDB
async function verifyLogin(req, res, { client, usersCol }) {
  const mongoSession = client.startSession();

  try {
    const credentials = req.body;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async () => {
      // Get the user from MongoDB
      const user = await usersCol.findOne({ username: credentials.username });

      if (user) {
        // Check if password given matches the stored password
        const passwordsMatch = await checkHashedPassword(
          credentials.password,
          user.password_hash
        );

        if (passwordsMatch) {
          const lastLogin = new Date();
          // Update the user's last login date
          await usersCol.updateOne(
            { _id: new ObjectId(user._id) },
            {
              $set: {
                lastLoginDate: lastLogin,
              },
            }
          );

          const verifiedUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            onboarded: user.onboarded,
            lastLoginDate: lastLogin,
          };

          // Send back verified user to NextAuth
          res.status(200).json(verifiedUser);
        } else {
          // Send an error status for an invalid password
          return res.status(401).json(null);
        }
      } else {
        // Send an error status for an invalid username
        return res.status(401).json(null);
      }
    });
  } catch (error) {
    console.error(`POST authorize request failed for : ${error}`);
    return res
      .status(500)
      .send(
        "An error occurred while authorizing this user's credentials. Please try again later!"
      );
  } finally {
    await mongoSession.endSession();
  }
}

// Check the encrypted password
async function checkHashedPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords: ", error);
    return false;
  }
}
