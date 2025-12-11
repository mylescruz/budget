// API Endpoint for a user's income data

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";
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

  const paycheckContext = {
    client: client,
    paychecksCol: db.collection("paychecks"),
    username: session.user.username,
  };

  switch (req.method) {
    case "PUT":
      return updatePaycheck(req, res, paycheckContext);
    case "DELETE":
      return deletePaycheck(req, res, paycheckContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Update the given paycheck for the user in MongoDB
async function updatePaycheck(req, res, { client, paychecksCol, username }) {
  const mongoSession = client.startSession();

  try {
    const paycheckId = req.query._id;

    const updatedPaycheck = {
      ...req.body,
      gross: req.body.gross * 100,
      taxes: req.body.gross * 100 - req.body.net * 100,
      net: req.body.net * 100,
    };

    // Define the date identifiers from the paycheck
    const updatedDate = new Date(`${updatedPaycheck.date}T00:00:00Z`);
    const updatedMonth = updatedDate.getUTCMonth() + 1;
    const updatedYear = updatedDate.getFullYear();

    await mongoSession.withTransaction(async (session) => {
      // Update the editted paycheck in MongoDB
      await paychecksCol.updateOne(
        { _id: new ObjectId(paycheckId), username },
        {
          $set: {
            month: updatedMonth,
            year: updatedYear,
            date: updatedPaycheck.date,
            company: updatedPaycheck.company.trim(),
            description: updatedPaycheck.description.trim(),
            gross: updatedPaycheck.gross,
            taxes: updatedPaycheck.taxes,
            net: updatedPaycheck.net,
          },
        },
        { session }
      );

      // Define the date identifiers from the old paycheck
      const oldPaycheckDate = new Date(`${updatedPaycheck.oldDate}T00:00:00Z`);
      const oldMonth = oldPaycheckDate.getUTCMonth() + 1;
      const oldYear = oldPaycheckDate.getFullYear();

      // Update the Guilt Free Spending category for the updated paycheck's month
      await updateGuiltFreeSpending({
        username,
        month: updatedMonth,
        year: updatedYear,
        session,
      });

      if (updatedMonth !== oldMonth) {
        // Update the Guilt Free Spending category for the editted paycheck's month
        await updateGuiltFreeSpending({
          username,
          month: oldMonth,
          year: oldYear,
          session,
        });
      }
    });

    // Send the updated paycheck back to the client
    return res.status(200).json(updatedPaycheck);
  } catch (error) {
    console.error(`PUT paycheck request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while editting a paycheck for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}

// Delete the given paycheck for the user in MongoDB
async function deletePaycheck(req, res, { client, paychecksCol, username }) {
  const mongoSession = client.startSession();

  try {
    const paycheckId = req.query._id;
    const paycheck = req.body;

    await mongoSession.withTransaction(async (session) => {
      // Delete the given paycheck from MongoDB
      await paychecksCol.deleteOne(
        { _id: new ObjectId(paycheckId) },
        { session }
      );

      // Define the identifiers from the paycheck
      const paycheckDate = new Date(`${paycheck.date}T00:00:00Z`);
      const month = paycheckDate.getUTCMonth() + 1;
      const year = paycheckDate.getFullYear();

      // Update the Guilt Free Spending category for the deleted paycheck's month
      await updateGuiltFreeSpending({ username, month, year, session });
    });

    // Send a success message back to the client
    return res
      .status(200)
      .json({ _id: paycheckId, message: "Paycheck deleted successfully" });
  } catch (error) {
    console.error(`DELETE paycheck request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while deleting a paycheck for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}
