// API Endpoint for a user's income data

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { updateFunMoney } from "@/lib/updateFunMoney";
import centsToDollars from "@/helpers/centsToDollars";
import { INCOME_TYPES } from "@/lib/constants/income";
import { logError } from "@/lib/logError";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";
import dollarsToCents from "@/helpers/dollarsToCents";

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
    transactionsCol: db.collection("transactions"),
    username: session.user.username,
  };

  switch (req.method) {
    case "PUT":
      return updateIncome(req, res, incomeContext);
    case "DELETE":
      return deleteIncome(req, res, incomeContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Update the given source of income for the user in MongoDB
async function updateIncome(req, res, { client, transactionsCol, username }) {
  const mongoSession = client.startSession();

  try {
    const sourceId = req.query._id;

    const updatedDate = new Date(`${req.body.date}T00:00:00Z`);
    const updatedMonth = updatedDate.getUTCMonth() + 1;
    const updatedYear = updatedDate.getFullYear();

    // Update the source of income in the transactions collection as well
    const updateQuery = {
      incomeType: req.body.incomeType,
      date: req.body.date,
      month: updatedMonth,
      year: updatedYear,
      source: req.body.source.trim(),
      description: req.body.description.trim(),
      amount: dollarsToCents(req.body.amount),
      updatedTS: new Date(),
    };

    // Update the extra fields for paychecks
    if (updateQuery.incomeType === INCOME_TYPES.PAYCHECK) {
      updateQuery.gross = dollarsToCents(req.body.gross);
      updateQuery.deductions =
        dollarsToCents(req.body.gross) - dollarsToCents(req.body.amount);
    }

    await mongoSession.withTransaction(async (session) => {
      await transactionsCol.updateOne(
        { _id: new ObjectId(sourceId) },
        { $set: updateQuery },
        { session, maxTimeMS: 5000 },
      );

      // Update the Fun Money category for the updated source's month
      await updateFunMoney({
        username,
        month: updatedMonth,
        year: updatedYear,
        session,
      });

      // Define the source's old date identifiers
      const oldSourceDate = new Date(`${req.body.oldDate}T00:00:00Z`);
      const oldMonth = oldSourceDate.getUTCMonth() + 1;
      const oldYear = oldSourceDate.getFullYear();

      if (updatedMonth !== oldMonth) {
        // Update the Fun Money category for the edited source's old month
        await updateFunMoney({
          username,
          month: oldMonth,
          year: oldYear,
          session,
        });
      }
    });

    // Send the updated source back to the client
    const updatedSource = {
      _id: sourceId,
      date: updateQuery.date,
      incomeType: updateQuery.incomeType,
      source: updateQuery.source,
      description: updateQuery.description,
      amount: centsToDollars(updateQuery.amount),
      createdTS: req.body.createdTS,
      updatedTS: updateQuery.updatedTS,
    };

    if (updateQuery.incomeType === INCOME_TYPES.PAYCHECK) {
      updatedSource.gross = centsToDollars(updateQuery.gross);
      updateQuery.deductions = centsToDollars(updateQuery.deductions);
    }

    return res.status(200).json(updatedSource);
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to edit this source of income at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}

// Delete the given source of income for the user in MongoDB
async function deleteIncome(req, res, { client, transactionsCol, username }) {
  const mongoSession = client.startSession();

  try {
    const sourceId = req.query._id;

    await mongoSession.withTransaction(async (session) => {
      // Delete the given source from MongoDB
      await transactionsCol.deleteOne(
        { _id: new ObjectId(sourceId) },
        { session, maxTimeMS: 5000 },
      );

      // Define the source's date identifiers
      const sourceDate = new Date(`${req.body.date}T00:00:00Z`);
      const month = sourceDate.getUTCMonth() + 1;
      const year = sourceDate.getFullYear();

      // Update the Fun Money category for the deleted source's month
      await updateFunMoney({ username, month, year, session });
    });

    return res
      .status(200)
      .json({ _id: sourceId, message: "Income deleted successfully" });
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to delete this source of income at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}
