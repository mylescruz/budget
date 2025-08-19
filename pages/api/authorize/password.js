// API Endpoint to authorize a user's credentials

import clientPromise from "@/lib/mongodb";

const bcrypt = require("bcrypt");

// Use bcrypt to check the encrypted password
async function checkHashedPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords: ", error);
    return false;
  }
}

export default async function handler(req, res) {
  const method = req?.method;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const usersCol = db.collection("users");

  if (method === "POST") {
    try {
      const credentials = req?.body;

      // Get the user from MongoDB
      const user = await usersCol.findOne({ username: credentials.username });

      if (user) {
        // Check if password given matches the stored password
        const passwordsMatch = await checkHashedPassword(
          credentials.password,
          user.password_hash
        );

        if (passwordsMatch) {
          const verifiedUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            onboarded: user.onboarded,
          };

          // Send back verified user to NextAuth
          res.status(200).json(verifiedUser);
        } else {
          // Send back a null if the credentials are incorrect
          res.status(401).json(null);
        }
      } else {
        // If no user found, return a null object
        res.status(401).json(null);
      }
    } catch (error) {
      console.error(`${method} authorize request failed: ${error}`);
      res
        .status(500)
        .send(
          "An error occurred while authorizing this user's credentials. Please try again later!"
        );
    }
  } else {
    res.status(405).send(`${method} method not allowed`);
  }
}
