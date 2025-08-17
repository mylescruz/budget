// API Endpoint for a user's categories data

import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

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

  if (method === "PUT") {
    try {
      const edittedCategory = req?.body;

      const result = await categoriesCol.updateOne(
        { _id: new ObjectId(edittedCategory.id) },
        {
          $set: {
            name: edittedCategory.name,
            color: edittedCategory.color,
            budget: edittedCategory.budget,
            actual: edittedCategory.actual,
            fixed: edittedCategory.fixed,
            hasSubcategory: edittedCategory.hasSubcategory,
            subcategories: edittedCategory.subcategories,
          },
        }
      );

      if (result.modifiedCount === 1) {
        res
          .status(200)
          .json({
            message: `Category ${edittedCategory.name} updated successfully`,
          });
      } else {
        throw new Error("Categories could not be updated");
      }
    } catch (error) {
      console.error(`${method} categories request failed: ${error}`);
      res.status(500).send("Error occurred while updating categories");
    }
  } else if (method === "DELETE") {
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
