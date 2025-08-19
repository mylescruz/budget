// API Endpoint to add a new user

import clientPromise from "@/lib/mongodb";

// Configuring bcrypt for password encryption
const bcrypt = require("bcrypt");
const saltRounds = 10;

const USER_ROLE = "User";

export default async function handler(req, res) {
  const method = req?.method;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const usersCol = db.collection("users");

  if (method === "POST") {
    try {
      const userBody = req?.body;

      // Encrypt the user's entered password by using bcrypt
      const hashedPassword = await bcrypt.hash(userBody.password, saltRounds);

      // Assign a timestamp for when the user created their profile
      const createdDate = new Date().toUTCString();

      // Add a user's file to their personal folder
      const userInfo = {
        name: userBody.name,
        email: userBody.email,
        username: userBody.username.toLowerCase(),
        password_hash: hashedPassword,
        role: USER_ROLE,
        onboarded: false,
        created_date: createdDate,
      };

      // Add the new user to MongoDB
      const result = await usersCol.insertOne(userInfo);

      // Remove the password from the user object
      const { password_hash, ...user } = userInfo;

      // Send the user back to the client
      res.status(200).json({ id: result.insertedId, ...user });
    } catch (error) {
      console.error(`${method} user request failed: ${error}`);
      res
        .status(500)
        .send(
          "An error occurred while creating your account. Please try again later!"
        );
    }
  } else {
    res.status(405).send(`${method} method not allowed`);
  }
}
