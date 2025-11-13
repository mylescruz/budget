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

  if (method === "PUT") {
    try {
      const edittedPaycheckBody = req?.body;

      const edittedPaycheck = {
        ...edittedPaycheckBody,
        gross: edittedPaycheckBody.gross * 100,
        taxes: edittedPaycheckBody.gross * 100 - edittedPaycheckBody.net * 100,
        net: edittedPaycheckBody.net * 100,
      };

      const updatedDate = new Date(`${edittedPaycheck.date}T00:00:00Z`);
      const updatedMonth = updatedDate.getMonth() + 1;
      const updatedYear = updatedDate.getFullYear();

      // Update the editted paycheck in MongoDB
      await paychecksCol.updateOne(
        { _id: new ObjectId(paycheckId), username: username },
        {
          $set: {
            month: updatedMonth,
            year: updatedYear,
            date: edittedPaycheck.date,
            company: edittedPaycheck.company,
            description: edittedPaycheck.description,
            gross: edittedPaycheck.gross,
            taxes: edittedPaycheck.taxes,
            net: edittedPaycheck.net,
          },
        }
      );

      // Define the identifiers from the paycheck
      const oldPaycheckDate = new Date(`${edittedPaycheck.oldDate}T00:00:00Z`);
      const newPaycheckDate = new Date(`${edittedPaycheck.date}T00:00:00Z`);
      const oldMonth = oldPaycheckDate.getMonth() + 1;
      const newMonth = newPaycheckDate.getMonth() + 1;
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

        // Update the Guilt Free Spending category's budget to adjust for the user's total income for the month minus the total budget
        const foundCategory = categories.find(
          (category) => category.name === "Guilt Free Spending"
        );

        if (foundCategory) {
          // Get the budget total for all categories
          let totalBudget = 0;
          categories.forEach((category) => {
            if (category.name !== "Guilt Free Spending") {
              totalBudget += category.budget;
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
      } else {
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

        // Update the Guilt Free Spending category's budget to adjust for the user's total income for the month minus the total budget
        const foundNewCategory = newMonthCategories.find(
          (category) => category.name === "Guilt Free Spending"
        );

        if (foundNewCategory) {
          // Get the budget total for all categories
          let totalBudget = 0;
          newMonthCategories.forEach((category) => {
            if (category.name !== "Guilt Free Spending") {
              totalBudget += category.budget;
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

        // Update the Guilt Free Spending category's budget to adjust for the user's total income for the month minus the total budget
        const foundOldCategory = oldMonthCategories.find(
          (category) => category.name === "Guilt Free Spending"
        );

        if (foundOldCategory) {
          // Get the budget total for all categories
          let totalBudget = 0;
          oldMonthCategories.forEach((category) => {
            if (category.name !== "Guilt Free Spending") {
              totalBudget += category.budget;
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

      // Update the Guilt Free Spending category's budget to adjust for the user's total income for the month minus the total budget
      const foundCategory = categories.find(
        (category) => category.name === "Guilt Free Spending"
      );

      if (foundCategory) {
        // Get the budget total for all categories
        let totalBudget = 0;
        categories.forEach((category) => {
          if (category.name !== "Guilt Free Spending") {
            totalBudget += category.budget;
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
