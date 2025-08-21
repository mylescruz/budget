// API Endpoint for a user's paychecks data

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  const username = session.user.username;

  const year = parseInt(req?.query?.year);
  const method = req?.method;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const paychecksCol = db.collection("paychecks");

  // Fucntion that returns the user's paychecks from MongoDB
  const getPaychecks = async () => {
    const docs = await paychecksCol
      .find({ username: username, year: year })
      .sort({ date: 1 })
      .toArray();

    const paychecks = docs.map((paycheck) => {
      return {
        id: paycheck._id,
        date: paycheck.date,
        company: paycheck.company,
        description: paycheck.description,
        gross: paycheck.gross,
        taxes: paycheck.taxes,
        net: paycheck.net,
      };
    });

    return paychecks;
  };

  if (method === "GET") {
    try {
      const paychecks = await getPaychecks();

      // Send the paychecks array in the response
      res.status(200).json(paychecks);
    } catch (error) {
      console.error(`${method} paychecks request failed: ${error}`);
      res.status(500).send(`Error occurred while getting ${username}'s income`);
    }
  } else if (method === "POST") {
    try {
      const paycheckBody = req?.body;

      // Define the identifiers from the paycheck
      const paycheckDate = new Date(paycheckBody.date);
      const monthName = paycheckDate.toLocaleDateString("en-US", {
        month: "long",
      });
      const month = paycheckDate.getMonth() + 1;
      const year = paycheckDate.getFullYear();

      // Assign the identifiers to the paycheck
      const newPaycheck = {
        username: username,
        month: month,
        year: year,
        ...paycheckBody,
      };

      // Add the new paycheck to the paychecks collection in MongoDB
      const insertedPaycheck = await paychecksCol.insertOne(newPaycheck);

      // Update the current month's history document with the new paycheck added to the budget
      const historyCol = db.collection("history");

      let updatedBudget = 0;
      let updatedActual = 0;
      let updatedLeftover = 0;

      // Find the history object in MongoDB
      const monthHistory = await historyCol.findOne({
        username: username,
        month: month,
        year: year,
      });

      // Update the budget and leftover amount
      if (monthHistory) {
        updatedActual = monthHistory.actual;

        updatedBudget = monthHistory.budget + parseFloat(newPaycheck.net);
        updatedLeftover = updatedBudget - updatedActual;
      } else {
        updatedBudget = parseFloat(newPaycheck.net);
        updatedActual = parseFloat(newPaycheck.net);
      }

      // Update the history month in MongoDB
      await historyCol.updateOne(
        { username: username, month: month, year: year },
        {
          $set: {
            monthName: monthName,
            month: month,
            year: year,
            budget: updatedBudget,
            actual: updatedActual,
            leftover: updatedLeftover,
          },
        },
        { upsert: true }
      );

      // Send the new paycheck back to the client
      res
        .status(200)
        .json({ id: insertedPaycheck.insertedId, ...paycheckBody });
    } catch (error) {
      console.error(`${method} paychecks request failed: ${error}`);
      res.status(500).send("Error occured while adding a paycheck");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
