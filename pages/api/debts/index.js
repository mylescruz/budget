import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { logError } from "@/lib/logError";
import dollarsToCents from "@/helpers/dollarsToCents";
import { DEBT_TYPE } from "@/lib/constants/debt";

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
    client,
    debtsCol: db.collection("debts"),
    username: authSession.user.username,
  };

  switch (req.method) {
    case "GET":
      return getDebts(req, res, debtsContext);
    case "POST":
      return addDebt(req, res, debtsContext);
    default:
      return res.status(405).send(`${req.method} method not allowed`);
  }
}

// Fetch the user's debts from MongoDB
async function getDebts(req, res, { debtsCol, username }) {
  try {
    const fetchedDebts = await debtsCol
      .aggregate([{ $match: { username } }])
      .toArray();

    return res.status(200).json(fetchedDebts);
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to fetch your debt at the moment. Please try again later!",
      );
  }
}

// Add a user's new debt to MongoDB
async function addDebt(req, res, { debtsCol, username }) {
  const debtInfo = req.body;

  const currentTS = new Date();

  try {
    // Format the new debt
    const newDebt = {
      username,
      type: debtInfo.type,
      lender: debtInfo.lender,
      active: true,
      currentBalance: dollarsToCents(debtInfo.currentBalance),
      apr: Number(debtInfo.apr),
      notes: debtInfo.notes,
      createdTS: currentTS,
      updatedTS: currentTS,
    };

    // Add specific fields for Loan type debt
    if (newDebt.type === DEBT_TYPE.LOAN) {
      newDebt.originalBalance = dollarsToCents(debtInfo.originalBalance);
      newDebt.startDate = new Date(debtInfo.startDate);
      newDebt.targetPayoffDate = new Date(debtInfo.targetPayoffDate);
    }

    // Add specific fields for Credit Card type debt
    if (newDebt.type === DEBT_TYPE.CREDIT_CARD) {
      newDebt.creditLimit = dollarsToCents(debtInfo.creditLimit);
      newDebt.promoAPR =
        debtInfo.promoAPR === "" ? null : Number(debtInfo.promoAPR);
      newDebt.promoAPREndDate =
        debtInfo.promoAPREndDate === ""
          ? null
          : new Date(debtInfo.promoAPREndDate);
    }

    let insertedDebt;

    // Insert the new debt into MongoDB
    insertedDebt = await debtsCol.insertOne(newDebt, {
      maxTimeMS: 5000,
    });

    return res.status(200).json({ _id: insertedDebt.insertedId, ...newDebt });
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to add your new debt at the moment. Please try again later!",
      );
  }
}
