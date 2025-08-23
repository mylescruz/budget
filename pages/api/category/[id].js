// API Endpoint for a user's categories data

import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

const GUILT_FREE = "Guilt Free Spending";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  const categoryId = req?.query?.id;
  const method = req?.method;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const categoriesCol = db.collection("categories");
  const paychecksCol = db.collection("paychecks");

  if (method === "DELETE") {
    try {
      // Get the current category to check session validation
      const category = await categoriesCol.findOne({
        _id: new ObjectId(categoryId),
      });

      // If a user tries to directly access a different user's data, send an error message
      if (session.user.username !== category.username) {
        return res.status(403).send("Access denied to this user's data");
      }

      // Delete category from MongoDB
      const result = await categoriesCol.deleteOne({
        _id: new ObjectId(categoryId),
      });

      if (result.deletedCount === 1) {
        // Update the Guilt Free Spending category's budget to adjust for the user's total income for the month minus the total budget
        const categories = await categoriesCol
          .find({
            username: session.user.username,
            month: category.month,
            year: category.year,
          })
          .toArray();

        const foundCategory = categories.find(
          (category) => category.name === GUILT_FREE
        );

        if (foundCategory) {
          // Get the budget total for all categories except Guilt Free Spending
          let categoriesBudget = 0;
          categories.forEach((category) => {
            if (category.name !== GUILT_FREE) {
              categoriesBudget += parseFloat(category.budget);
            }
          });

          // Get the total net income for the month
          const paychecks = await paychecksCol
            .find({
              username: session.user.username,
              month: category.month,
              year: category.year,
            })
            .toArray();
          const totalBudget = paychecks.reduce(
            (sum, current) => sum + current.net,
            0
          );

          const gfsBudget = totalBudget - categoriesBudget;

          // Update the Guilt Free Spending category in MongoDB
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
          .json({ id: categoryId, message: "Category deleted successfully" });
      } else {
        // Send an error message back to the client
        res.status(404).send("Category was not found");
      }
    } catch (error) {
      console.error(`${method} categories request failed: ${error}`);
      res.status(500).send("Error occurred while deleting a category");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
