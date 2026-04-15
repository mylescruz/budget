// API Endpoint to check if a username exists

import { logError } from "@/lib/logError";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const usersCol = db.collection("users");

  switch (req.method) {
    case "GET":
      return checkUsername(req, res, usersCol);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Check if the username is already used in the app
async function checkUsername(req, res, usersCol) {
  try {
    const user = await usersCol.findOne(
      {
        username: req.query.username.toLowerCase(),
      },
      { maxTimeMS: 5000 },
    );

    if (user) {
      // Send a response showing the username exists
      return res.status(200).json({ exists: true });
    } else {
      // The user can successfully use that username
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    await logError({ error, req, username: req.query.username });

    return res
      .status(500)
      .send(
        "We're unable to check if this username is taken at the moment. Please try again later!",
      );
  }
}
