// API Endpoint to check if a username exists

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
    const user = await usersCol.findOne({
      username: req.query.username.toLowerCase(),
    });

    if (user) {
      // Send a response showing the username exists
      return res.status(200).json({ exists: true });
    } else {
      // The user can successfully use that username
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(`GET authorize/username request failed: ${error}`);
    return res
      .status(500)
      .send(
        "An error occurred while checking if this username exists. Please try again later!"
      );
  }
}
