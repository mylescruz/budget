// API Endpoint to check if a username exists

import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  const method = req?.method;
  const username = req?.query?.username.toLowerCase();

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const usersCol = db.collection("users");

  if (method === "GET") {
    try {
      const user = await usersCol.findOne({ username: username });

      if (user) {
        // Send a response showing the user exists
        res.status(200).json({ exists: true });
      } else {
        // If user doesn't exist, the user can successfully use that username
        res.status(200).json({ exists: false });
      }
    } catch (error) {
      console.error(`${method} authorize/username request failed: ${error}`);
      res
        .status(500)
        .send(
          "An error occurred while checking if this user exists. Please try again later!"
        );
    }
  } else {
    res.status(405).send(`${method} method not allowed`);
  }
}
