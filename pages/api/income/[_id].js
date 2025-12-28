// API Endpoint for a user's income data

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";
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
    case "PUT":
      return updateIncome(req, res, incomeContext);
    case "DELETE":
      return deleteIncome(req, res, incomeContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Update the given source of income for the user in MongoDB
async function updateIncome(req, res, { client, incomeCol, username }) {
  const mongoSession = client.startSession();

  try {
    const sourceId = req.query._id;

    const updatedSource = {
      ...req.body,
      amount: parseFloat(req.body.amount) * 100,
    };

    if (updatedSource.type === "Paycheck") {
      updatedSource.gross = parseFloat(req.body.gross) * 100;
      updatedSource.deductions = subtractDecimalValues(
        req.body.gross,
        req.body.amount
      );
    }

    // Define the source's date identifiers
    const updatedDate = new Date(`${updatedSource.date}T00:00:00Z`);
    const updatedMonth = updatedDate.getUTCMonth() + 1;
    const updatedYear = updatedDate.getFullYear();

    await mongoSession.withTransaction(async (session) => {
      // Update the edited source in MongoDB
      if (updatedSource.type === "Paycheck") {
        await incomeCol.updateOne(
          { _id: new ObjectId(sourceId), username },
          {
            $set: {
              month: updatedMonth,
              year: updatedYear,
              date: updatedSource.date,
              name: updatedSource.name.trim(),
              description: updatedSource.description.trim(),
              gross: updatedSource.gross,
              deductions: updatedSource.deductions,
              amount: updatedSource.amount,
            },
          },
          { session }
        );
      } else {
        await incomeCol.updateOne(
          { _id: new ObjectId(sourceId), username },
          {
            $set: {
              month: updatedMonth,
              year: updatedYear,
              date: updatedSource.date,
              name: updatedSource.name.trim(),
              description: updatedSource.description.trim(),
              amount: updatedSource.amount,
            },
          },
          { session }
        );
      }

      // Define the source's old date identifiers
      const oldSourceDate = new Date(`${updatedSource.oldDate}T00:00:00Z`);
      const oldMonth = oldSourceDate.getUTCMonth() + 1;
      const oldYear = oldSourceDate.getFullYear();

      // Update the Fun Money category for the updated source's month
      await updateFunMoney({
        username,
        month: updatedMonth,
        year: updatedYear,
        session,
      });

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
    if (updatedSource.type === "Paycheck") {
      updatedSource.gross = updatedSource.gross / 100;
      updatedSource.deductions = updatedSource.deductions / 100;
    }

    return res
      .status(200)
      .json({ ...updatedSource, amount: updatedSource.amount / 100 });
  } catch (error) {
    console.error(`PUT income request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while editting a source of income for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}

// Delete the given source of income for the user in MongoDB
async function deleteIncome(req, res, { client, incomeCol, username }) {
  const mongoSession = client.startSession();

  try {
    const sourceId = req.query._id;
    const source = req.body;

    await mongoSession.withTransaction(async (session) => {
      // Delete the given source from MongoDB
      await incomeCol.deleteOne({ _id: new ObjectId(sourceId) }, { session });

      // Define the source's date identifiers
      const sourceDate = new Date(`${source.date}T00:00:00Z`);
      const month = sourceDate.getUTCMonth() + 1;
      const year = sourceDate.getFullYear();

      // Update the Fun Money category for the deleted source's month
      await updateFunMoney({ username, month, year, session });
    });

    return res
      .status(200)
      .json({ _id: sourceId, message: "Income deleted successfully" });
  } catch (error) {
    console.error(`DELETE income request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while deleting a source of income for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}
