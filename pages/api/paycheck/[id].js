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
  const categoriesCol = db.collection("categories");
  const historyCol = db.collection("history");

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

      if (oldMonth === newMonth) {
        // Update the old month's budget and leftover amount

        // Get the total net income for the old month
        const paychecks = await paychecksCol
          .find({ username: username, month: newMonth, year: year })
          .toArray();
        const updatedBudget = paychecks.reduce(
          (sum, current) => sum + current.net,
          0
        );

        // Get the total actual value for all categories
        const categories = await categoriesCol
          .find({ username: username, month: newMonth, year: year })
          .toArray();
        const updatedActual = categories.reduce(
          (sum, current) => sum + current.actual,
          0
        );

        const updatedLeftover = updatedBudget - updatedActual;

        // Update the Guilt Free Spending category's budget to adjust for the user's total income for the month minus the total budget
        const foundCategory = categories.find(
          (category) => category.name === "Guilt Free Spending"
        );

        if (foundCategory) {
          // Get the budget total for all categories
          let totalBudget = 0;
          categories.forEach((category) => {
            if (category.name !== "Guilt Free Spending") {
              totalBudget += parseFloat(category.budget);
            }
          });

          const gfsBudget = updatedBudget - totalBudget;

          await categoriesCol.updateOne(
            { _id: foundCategory._id },
            {
              $set: {
                budget: gfsBudget,
              },
            }
          );
        }

        // Update the new history month in MongoDB
        await historyCol.updateOne(
          { username: username, month: newMonth, year: year },
          {
            $set: {
              monthName: newMonthName,
              month: newMonth,
              year: year,
              budget: updatedBudget,
              actual: updatedActual,
              leftover: updatedLeftover,
            },
          }
        );
      } else {
        // If the month changed, update both the new month's history and old month's history

        // Get the total net income for the new month
        const newMonthPaychecks = await paychecksCol
          .find({ username: username, month: newMonth, year: year })
          .toArray();
        const updatedNewBudget = newMonthPaychecks.reduce(
          (sum, current) => sum + current.net,
          0
        );

        // Get the total actual value for all categories
        const newMonthCategories = await categoriesCol
          .find({ username: username, month: newMonth, year: year })
          .toArray();
        const updatedNewActual = newMonthCategories.reduce(
          (sum, current) => sum + current.actual,
          0
        );

        const updatedNewLeftover = updatedNewBudget - updatedNewActual;

        // Update the Guilt Free Spending category's budget to adjust for the user's total income for the month minus the total budget
        const foundNewCategory = newMonthCategories.find(
          (category) => category.name === "Guilt Free Spending"
        );

        if (foundNewCategory) {
          // Get the budget total for all categories
          let totalBudget = 0;
          newMonthCategories.forEach((category) => {
            if (category.name !== "Guilt Free Spending") {
              totalBudget += parseFloat(category.budget);
            }
          });

          const gfsBudget = updatedNewBudget - totalBudget;

          await categoriesCol.updateOne(
            { _id: foundNewCategory._id },
            {
              $set: {
                budget: gfsBudget,
              },
            }
          );
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
              actual: updatedNewActual,
              leftover: updatedNewLeftover,
            },
          },
          { upsert: true }
        );

        // Get the total net income for the old month
        const oldMonthPaychecks = await paychecksCol
          .find({ username: username, month: oldMonth, year: year })
          .toArray();
        const updatedOldBudget = oldMonthPaychecks.reduce(
          (sum, current) => sum + current.net,
          0
        );

        // Get the total actual value for all categories
        const oldMonthCategories = await categoriesCol
          .find({ username: username, month: oldMonth, year: year })
          .toArray();
        const updatedOldActual = oldMonthCategories.reduce(
          (sum, current) => sum + current.actual,
          0
        );

        const updatedOldLeftover = updatedOldBudget - updatedOldActual;

        // Update the Guilt Free Spending category's budget to adjust for the user's total income for the month minus the total budget
        const foundOldCategory = oldMonthCategories.find(
          (category) => category.name === "Guilt Free Spending"
        );

        if (foundOldCategory) {
          // Get the budget total for all categories
          let totalBudget = 0;
          oldMonthCategories.forEach((category) => {
            if (category.name !== "Guilt Free Spending") {
              totalBudget += parseFloat(category.budget);
            }
          });

          const gfsBudget = updatedOldBudget - totalBudget;

          await categoriesCol.updateOne(
            { _id: foundOldCategory._id },
            {
              $set: {
                budget: gfsBudget,
              },
            }
          );
        }

        // Update the new history month in MongoDB
        await historyCol.updateOne(
          { username: username, month: oldMonth, year: year },
          {
            $set: {
              monthName: oldMonthName,
              month: oldMonth,
              year: year,
              budget: updatedOldBudget,
              actual: updatedOldActual,
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

      // Update the budget and leftover amount

      // Get the total net income for the given month
      const paychecks = await paychecksCol
        .find({ username: username, month: month, year: year })
        .toArray();
      const updatedBudget = paychecks.reduce(
        (sum, current) => sum + current.net,
        0
      );

      // Get the total actual value for all categories
      const categories = await categoriesCol
        .find({ username: username, month: month, year: year })
        .toArray();
      const updatedActual = categories.reduce(
        (sum, current) => sum + current.actual,
        0
      );

      const updatedLeftover = updatedBudget - updatedActual;

      // Update the Guilt Free Spending category's budget to adjust for the user's total income for the month minus the total budget
      const foundCategory = categories.find(
        (category) => category.name === "Guilt Free Spending"
      );

      if (foundCategory) {
        // Get the budget total for all categories
        let totalBudget = 0;
        categories.forEach((category) => {
          if (category.name !== "Guilt Free Spending") {
            totalBudget += parseFloat(category.budget);
          }
        });

        const gfsBudget = updatedBudget - totalBudget;

        await categoriesCol.updateOne(
          { _id: foundCategory._id },
          {
            $set: {
              budget: gfsBudget,
            },
          }
        );
      }

      // Update the history month in MongoDB
      await historyCol.updateOne(
        { username: username, month: month, year: year },
        {
          $set: {
            budget: updatedBudget,
            actual: updatedActual,
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
