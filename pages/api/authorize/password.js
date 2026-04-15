// API Endpoint to authorize a user's credentials

import { logError } from "@/lib/logError";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const bcrypt = require("bcryptjs");

export default async function handler(req, res) {
  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const usersCol = db.collection("users");

  switch (req.method) {
    case "POST":
      return verifyLogin(req, res, usersCol);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Verify given credentials with the credentials stored in MongoDB
async function verifyLogin(req, res, usersCol) {
  try {
    const credentials = req.body;

    // Get the user from MongoDB
    const user = await usersCol.findOne(
      { username: credentials.username },
      { maxTimeMS: 5000 },
    );

    if (!user) {
      // Send an error status for an invalid username
      return res.status(401).json(null);
    }

    // Check if password given matches the stored password
    const passwordsMatch = await checkHashedPassword(
      credentials.password,
      user.password_hash,
    );

    if (!passwordsMatch) {
      // Send an error status for an invalid password
      return res.status(401).json(null);
    }

    // Update the user's last login date
    const currentTS = new Date();

    await usersCol.updateOne(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          lastLoginTS: currentTS,
        },
      },
      { maxTimeMS: 5000 },
    );

    const verifiedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      onboarded: user.onboarded,
      createdTS: user.createdTS,
      lastLoginTS: currentTS,
    };

    // Send back verified user to NextAuth
    return res.status(200).json(verifiedUser);
  } catch (error) {
    await logError({ error, req, username: req.body.username });

    return res
      .status(500)
      .send(
        "We're unable to edit verify your credentials at the moment. Please try again later!",
      );
  }
}

// Check the encrypted password
async function checkHashedPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    return false;
  }
}
