// API Endpoint for a user's information

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Configuring bcrypt for password encryption
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Function to compare the given password with the stored encrypted password
async function checkHashedPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (err) {
    console.error("Error comparing passwords: ", err);
    return false;
  }
}

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("You must login to view this information");
  }

  const username = session.user.username;

  const method = req?.method;
  const id = req?.query?.id;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const usersCol = db.collection("users");

  // Function to get a user's information from MongoDB
  const getUser = async () => {
    const result = await usersCol.findOne({ _id: new ObjectId(id) });

    const { _id, ...user } = result;

    return {
      id: _id,
      ...user,
    };
  };

  if (method === "GET") {
    try {
      const user = await getUser();

      // Return the user without their password
      const { password_hash, ...userInfo } = user;

      // Send the user back to the client
      res.status(200).json(userInfo);
    } catch (error) {
      console.error(`${method} user request failed: ${error}`);
      res
        .status(500)
        .send(
          "An error occurred while getting your account info. Please try again later!"
        );
    }
  } else if (method === "PUT") {
    try {
      const edittedUser = req?.body;

      // Function to update parts of the user
      const updateUser = async (edittedUser) => {
        if (edittedUser.onboarded === false) {
          // Update a user confirming they have been onboarded
          await usersCol.updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                onboarded: true,
              },
            }
          );

          return true;
        } else {
          // Get the current user
          const user = await getUser();

          // Check if the passwords match
          const passwordsMatch = await checkHashedPassword(
            edittedUser.currentPassword,
            user.password_hash
          );

          if (passwordsMatch) {
            let updatedPassword = user.password_hash;
            let updatedEmail = user.email;

            if ("newPassword" in edittedUser) {
              updatedPassword = await bcrypt.hash(
                edittedUser.newPassword,
                saltRounds
              );
            }

            if ("newEmail" in edittedUser) {
              updatedEmail = edittedUser.newEmail;
            }

            await usersCol.updateOne(
              { _id: new ObjectId(id) },
              {
                $set: {
                  email: updatedEmail,
                  password_hash: updatedPassword,
                },
              }
            );

            return true;
          } else {
            return false;
          }
        }
      };

      const result = await updateUser(edittedUser);

      if (!result) {
        // If the passwords don't match, send back a null object signifying invalid credentials
        return res
          .status(401)
          .send("Passwords do not match. Cannot update the password.");
      }

      // Get the updated user
      const updatedUser = await getUser();

      // Return the updatedUser without their password
      const { password_hash, ...userInfo } = updatedUser;

      // Send the verified user object back to the client
      res.status(200).json(userInfo);
    } catch (err) {
      console.error(`${method} user request failed: ${err}`);
      res
        .status(500)
        .send(
          "An error occurred while updating your account. Please try again later!"
        );
    }
  } else if (method === "DELETE") {
    try {
      const deletedUser = req?.body;

      // Get the current users information
      const user = await getUser();

      // Check if the passwords match
      const passwordsMatch = await checkHashedPassword(
        deletedUser.password,
        user.password_hash
      );

      if (passwordsMatch) {
        // Delete the user from the users collection
        await usersCol.deleteOne({ _id: new ObjectId(id) });

        // Delete the users documents from the categories collection
        await db.collection("categories").deleteMany({ username: username });

        // Delete the users documents from the transactions collection
        await db.collection("transactions").deleteMany({ username: username });

        // Delete the users documents from the paychecks collection
        await db.collection("paychecks").deleteMany({ username: username });

        // Delete the users documents from the history collection
        await db.collection("history").deleteMany({ username: username });

        // Send back a successful status that the user was deleted
        res.status(200).send();
      } else {
        // If the passwords don't match, send back an error message
        res
          .status(401)
          .send("Passwords do not match. Cannot delete your account.");
      }
    } catch (err) {
      console.error(`${method} user request failed: ${err}`);
      res
        .status(500)
        .send(
          "An error occurred while deleting your account. Please try again later!"
        );
    }
  } else {
    res.status(405).send(`${method} method not allowed`);
  }
}
