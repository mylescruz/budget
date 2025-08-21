// API Endpoint for a user's income data

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  const username = session.user.username;

  const paycheckId = req?.query?.id;
  const method = req?.method;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const paychecksCol = db.collection("paychecks");

  if (method === "PUT") {
    try {
      const edittedPaycheck = req?.body;

      // Update the editted paycheck in MongoDB
      await paychecksCol.updateOne(
        { _id: new ObjectId(paycheckId), username: username },
        {
          $set: {
            date: edittedPaycheck.date,
            company: edittedPaycheck.company,
            description: edittedPaycheck.description,
            gross: edittedPaycheck.gross,
            taxes: edittedPaycheck.taxes,
            net: edittedPaycheck.net,
          },
        }
      );

      // Update the current month's history document with the new paycheck added to the budget
      const historyCol = db.collection("history");

      // Define the identifiers from the paycheck
      const oldPaycheckDate = new Date(edittedPaycheck.oldDate);
      const newPaycheckDate = new Date(edittedPaycheck.date);
      const oldMonth = oldPaycheckDate.getMonth() + 1;
      const oldMonthName = oldPaycheckDate.toLocaleDateString("en-US", {
        month: "long",
      });
      const newMonth = newPaycheckDate.getMonth() + 1;
      const newMonthName = newPaycheckDate.toLocaleDateString("en-US", {
        month: "long",
      });
      const year = oldPaycheckDate.getFullYear();
      const oldPaycheckNet = edittedPaycheck.oldNet;
      const newPaycheckNet = edittedPaycheck.net;

      if (oldMonth === newMonth) {
        // Only update the current month's history if the month did not change
        const monthHistory = await historyCol.findOne({
          username: username,
          month: newMonth,
          year: year,
        });

        // Update the budget and leftover amount
        const updatedBudget =
          monthHistory.budget +
          parseFloat(newPaycheckNet) -
          parseFloat(oldPaycheckNet);
        const updatedLeftover = updatedBudget - monthHistory.actual;

        // Update the history month in MongoDB
        await historyCol.updateOne(
          { _id: new ObjectId(monthHistory._id) },
          {
            $set: {
              budget: updatedBudget,
              actual: monthHistory.actual,
              leftover: updatedLeftover,
            },
          }
        );
      } else {
        // If the month changed, update both the old month's history and new month's history

        // Find the new history month
        const newMonthHistory = await historyCol.findOne({
          username: username,
          month: newMonth,
          year: year,
        });

        let updatedNewBudget = 0;
        let updatedActual = 0;
        let updatedNewLeftover = 0;

        if (newMonthHistory) {
          // Update the new budget and leftover amount
          updatedNewBudget =
            newMonthHistory.budget + parseFloat(newPaycheckNet);
          updatedActual = newMonthHistory.actual;
          updatedNewLeftover = updatedNewBudget - newMonthHistory.actual;
        } else {
          updatedNewBudget = newPaycheckNet;
          updatedNewLeftover = newPaycheckNet;
        }

        // Update the new history month in MongoDB
        await historyCol.updateOne(
          { username: username, month: newMonth, year: year },
          {
            $set: {
              monthName: newMonthName,
              month: newMonth,
              year: year,
              budget: updatedNewBudget,
              actual: updatedActual,
              leftover: updatedNewLeftover,
            },
          },
          { upsert: true }
        );

        // Find the old history month
        const oldMonthHistory = await historyCol.findOne({
          username: username,
          month: newMonth,
          year: year,
        });

        // Update the old budget and leftover amount
        const updatedOldBudget =
          oldMonthHistory.budget + parseFloat(newPaycheckNet);
        const updatedOldLeftover = updatedOldBudget - oldMonthHistory.actual;

        // Update the old history month in MongoDB
        await historyCol.updateOne(
          { _id: new ObjectId(oldMonthHistory._id) },
          {
            $set: {
              budget: updatedOldBudget,
              actual: oldMonthHistory.actual,
              leftover: updatedOldLeftover,
            },
          }
        );
      }

      // Send the updated paycheck back to the client
      res.status(200).json(edittedPaycheck);
    } catch (error) {
      console.error(`${method} paycheck request failed: ${error}`);
      res.status(500).send("Error occurred while editting a paycheck");
    }
  } else if (method === "DELETE") {
    try {
      const paycheck = req?.body;

      // Delete the given paycheck from MongoDB
      await paychecksCol.deleteOne({ _id: new ObjectId(paycheckId) });

      // Define the identifiers from the paycheck
      const paycheckDate = new Date(paycheck.date);
      const month = paycheckDate.getMonth() + 1;
      const year = paycheckDate.getFullYear();

      // Update the current month's history document with the new paycheck added to the budget
      const historyCol = db.collection("history");

      const monthHistory = await historyCol.findOne({
        username: username,
        month: month,
        year: year,
      });

      // Update the budget and leftover amount
      const updatedBudget = monthHistory.budget - parseFloat(paycheck.net);
      const updatedLeftover = updatedBudget - monthHistory.actual;

      // Update the history month in MongoDB
      await historyCol.updateOne(
        { username: username, month: month, year: year },
        {
          $set: {
            budget: updatedBudget,
            actual: monthHistory.actual,
            leftover: updatedLeftover,
          },
        }
      );

      // Send a success message back to the client
      res
        .status(200)
        .json({ id: paycheckId, message: "Paycheck deleted successfully" });
    } catch (err) {
      console.error(`${method} paycheck request failed: ${err}`);
      res.status(500).send("Error occurred while deleting a paycheck");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
