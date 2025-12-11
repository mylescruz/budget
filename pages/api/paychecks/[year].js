// API Endpoint for a user's paychecks data

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { updateGuiltFreeSpending } from "@/lib/updateGuiltFreeSpending";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const paychecksContext = {
    client: client,
    paychecksCol: db.collection("paychecks"),
    username: session.user.username,
  };

  switch (req.method) {
    case "GET":
      return getPaychecks(req, res, paychecksContext);
    case "POST":
      return addPaycheck(req, res, paychecksContext);
    default:
      es.status(405).send(`${req.method} method not allowed`);
  }
}

// Get the user's paychecks from MongoDB
async function getPaychecks(req, res, { paychecksCol, username }) {
  const year = parseInt(req.query.year);

  try {
    const paychecks = await paychecksCol
      .find(
        { username, year },
        { projection: { username: 0, month: 0, year: 0 } }
      )
      .sort({ date: 1 })
      .toArray();

    // Send the user's paychecks back to the client
    return res.status(200).json(paychecks);
  } catch (error) {
    console.error(`GET paychecks request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while getting the paychecks for ${username}`);
  }
}

async function addPaycheck(req, res, { client, paychecksCol, username }) {
  const mongoSession = client.startSession();

  try {
    // Define the date identifiers from the paycheck
    const paycheckDate = new Date(`${req.body.date}T00:00:00Z`);
    const paycheckMonth = paycheckDate.getUTCMonth() + 1;
    const paycheckYear = paycheckDate.getFullYear();

    // Assign the identifiers to the paycheck
    const newPaycheck = {
      date: req.body.date,
      company: req.body.company.trim(),
      description: req.body.description.trim(),
      gross: req.body.gross * 100,
      taxes: req.body.gross * 100 - req.body.net * 100,
      net: req.body.net * 100,
      username,
      month: paycheckMonth,
      year: paycheckYear,
    };

    let insertedPaycheck;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Add the new paycheck to the paychecks collection in MongoDB
      insertedPaycheck = await paychecksCol.insertOne(newPaycheck, {
        session,
      });

      // Update the Guilt Free Spending category for the paycheck's month
      await updateGuiltFreeSpending({
        username,
        month: paycheckMonth,
        year: paycheckYear,
        session,
      });
    });

    const { username: u, month: m, year: y, ...addedPaycheck } = newPaycheck;

    // Send the new paycheck back to the client
    return res
      .status(200)
      .json({ _id: insertedPaycheck.insertedId, ...addedPaycheck });
  } catch (error) {
    console.error(`POST paychecks request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occured while adding a paycheck for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}
