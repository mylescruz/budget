import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { logError } from "@/lib/logError";
import dollarsToCents from "@/helpers/dollarsToCents";
import { DEBT_TYPE } from "@/lib/constants/debt";
import centsToDollars from "@/helpers/centsToDollars";

export default async function handler(req, res) {
  // Establish NextAuth.js session
  const authSession = await getServerSession(req, res, authOptions);

  if (!authSession) {
    return res.status(401).send("Must login to view your data!");
  }

  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const debtsContext = {
    client: client,
    debtsCol: db.collection("debts"),
    username: authSession.user.username,
  };

  switch (req.method) {
    case "PUT":
      return updateDebt(req, res, debtsContext);
    case "DELETE":
      return deleteDebt(req, res, debtsContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Updated the given debt for the user in MongoDB
async function updateDebt(req, res, { client, debtsCol, username }) {
  const mongoSession = client.startSession();

  const debtId = req.query._id;

  const editedDebt = { ...req.body };

  const currentTS = new Date();

  try {
    // Format the new debt
    const debtQuery = {
      lender: editedDebt.lender,
      currentBalance: dollarsToCents(editedDebt.currentBalance),
      apr: Number(editedDebt.apr),
      monthlyPayment: dollarsToCents(editedDebt.monthlyPayment),
      dueDate: Number(editedDebt.dueDate),
      updatedTS: currentTS,
    };

    // Add specific fields for Loan type debt
    if (editedDebt.type === DEBT_TYPE.LOAN) {
      debtQuery.originalBalance = dollarsToCents(editedDebt.originalBalance);
      debtQuery.startDate = new Date(editedDebt.startDate);
      debtQuery.targetPayoffDate = new Date(editedDebt.targetPayoffDate);
    }

    // Add specific fields for Credit Card type debt
    if (editedDebt.type === DEBT_TYPE.CREDIT_CARD) {
      debtQuery.creditLimit = dollarsToCents(editedDebt.creditLimit);
    }

    await mongoSession.withTransaction(async (session) => {
      // Update the given debt into MongoDB
      await debtsCol.updateOne(
        { _id: new ObjectId(debtId) },
        {
          $set: debtQuery,
        },
        {
          session,
          maxTimeMS: 5000,
        },
      );
    });

    const updatedDebt = {
      ...editedDebt,
      currentBalance: centsToDollars(debtQuery.currentBalance),
      monthlyPayment: centsToDollars(debtQuery.monthlyPayment),
      apr: debtQuery.apr,
      dueDate: debtQuery.dueDate,
      updatedTS: debtQuery.updatedTS,
    };

    if (updatedDebt.type === DEBT_TYPE.LOAN) {
      updatedDebt.originalBalance = centsToDollars(debtQuery.originalBalance);
      debtQuery.startDate = debtQuery.startDate;
      debtQuery.targetPayoffDate = debtQuery.targetPayoffDate;
    }

    if (updatedDebt.type === DEBT_TYPE.CREDIT_CARD) {
      updatedDebt.creditLimit = centsToDollars(debtQuery.creditLimit);
    }

    return res.status(200).json(updatedDebt);
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to edit this debt at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}

// Delete the selected debt for the user in MongoDB
async function deleteDebt(req, res, { client, debtsCol, username }) {
  const mongoSession = client.startSession();

  try {
    const debtId = req.query._id;

    await mongoSession.withTransaction(async (session) => {
      // Delete the given debt from MongoDB
      await debtsCol.deleteOne(
        { _id: new ObjectId(debtId) },
        { session, maxTimeMS: 5000 },
      );
    });

    return res
      .status(200)
      .json({ _id: debtId, message: "This debt was deleted successfully" });
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to delete this debt at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}
