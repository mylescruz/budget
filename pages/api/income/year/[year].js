// API Endpoint for a user's income

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { updateFunMoney } from "@/lib/updateFunMoney";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";

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

  const incomeContext = {
    client: client,
    incomeCol: db.collection("income"),
    username: session.user.username,
  };

  switch (req.method) {
    case "GET":
      return getIncome(req, res, incomeContext);
    case "POST":
      return addIncome(req, res, incomeContext);
    default:
      es.status(405).send(`${req.method} method not allowed`);
  }
}

// Get user's income array from MongoDB
async function getIncome(req, res, { incomeCol, username }) {
  const year = parseInt(req.query.year);

  try {
    const incomeDocs = await incomeCol.find({ username, year }).toArray();

    const income = incomeDocs.map((source) => {
      const formattedSource = {
        _id: source._id,
        date: source.date,
        type: source.type,
        name: source.name,
        description: source.description,
        amount: source.amount / 100,
      };

      if (source.type === "Paycheck") {
        formattedSource.gross = source.gross / 100;
        formattedSource.deductions = source.deductions / 100;
      }

      return formattedSource;
    });

    return res.status(200).json(income);
  } catch (error) {
    console.error(`GET income request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while getting the income for ${username}`);
  }
}

// Add a user's new source of income to MongoDB
async function addIncome(req, res, { client, incomeCol, username }) {
  const mongoSession = client.startSession();

  try {
    // Define the source's date identifiers
    const sourceDate = new Date(`${req.body.date}T00:00:00Z`);
    const sourceMonth = sourceDate.getUTCMonth() + 1;
    const sourceYear = sourceDate.getFullYear();

    // Assign the source's identifiers
    const newSource = {
      type: req.body.type,
      date: req.body.date,
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      amount: parseFloat(req.body.amount) * 100,
      username,
      month: sourceMonth,
      year: sourceYear,
    };

    if (newSource.type === "Paycheck") {
      newSource.gross = parseFloat(req.body.gross) * 100;
      newSource.deductions = subtractDecimalValues(
        req.body.gross,
        req.body.amount
      );
    }

    if (newSource.type === "Unemployment") {
      newSource.name = "EDD";
    }

    let insertedSource;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Add the new source to the income collection in MongoDB
      insertedSource = await incomeCol.insertOne(newSource, {
        session,
      });

      // Update the Fun Money category for the source's month
      await updateFunMoney({
        username,
        month: sourceMonth,
        year: sourceYear,
        session,
      });
    });

    const { username: u, month: m, year: y, ...sourceDetails } = newSource;

    const addedSource = {
      ...sourceDetails,
      _id: insertedSource.insertedId,
      amount: sourceDetails.amount / 100,
    };

    if (addedSource.type === "Paycheck") {
      addedSource.gross = addedSource.gross / 100;
      addedSource.deductions = addedSource.deductions / 100;
    }

    // Send the new source back to the client
    return res
      .status(200)
      .json({ _id: insertedSource.insertedId, ...addedSource });
  } catch (error) {
    console.error(`POST income request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occured while adding a source of income for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}
