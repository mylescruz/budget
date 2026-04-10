// API endpoint to add a new user to the system
import clientPromise from "@/lib/mongodb";

// Configuring bcrypt for password encryption
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const USER_ROLE = "User";

export default async function handler(req, res) {
  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const usersCol = db.collection("users");

  switch (req.method) {
    case "POST":
      return createNewUser(req, res, usersCol);
    default:
      return res.status(405).send(`Method ${req.method} is not allowed`);
  }
}

async function createNewUser(req, res, usersCol) {
  try {
    const newUser = req.body;

    // Add the user to MongoDB
    const insertedUser = await addUser(newUser, usersCol);

    // Return the new user
    return res.status(200).json(insertedUser);
  } catch (error) {
    console.error(`POST createUser request failed: ${error}`);
    return res
      .status(500)
      .send(
        "Sorry! We're unable to create your new account at the moment. Please try again later!",
      );
  }
}

async function addUser(newUser, usersCol) {
  // Encrypt the user's entered password by using bcrypt
  const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);

  const currentTS = new Date();

  const userInfo = {
    name: newUser.name.trim(),
    email: newUser.email.trim(),
    username: newUser.username.toLowerCase().trim(),
    password_hash: hashedPassword,
    role: USER_ROLE,
    active: true,
    onboarded: false,
    createdTS: currentTS,
    lastLoginTS: currentTS,
  };

  // Add the new user to MongoDB
  const insertedUser = await usersCol.insertOne(userInfo, { maxTimeMS: 5000 });

  // Remove the password from the user object
  const { password_hash, ...user } = userInfo;

  return { _id: insertedUser.insertedId, ...user };
}
