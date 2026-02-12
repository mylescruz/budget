import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export default async function handler(req, res) {
  // Use NextAuth to authenticate a user's session
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).send(`Must login to view your data!`);
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const previousCategoriesContext = {
    categoriesCol: db.collection("categories"),
    username: session.user.username,
  };

  switch (req.method) {
    case "GET":
      return getPreviousCategories(req, res, previousCategoriesContext);
    default:
      return res.status(405).send(`Method ${req.method} is not allowed`);
  }
}

// Get the user's categories that aren't in their current month's budget
async function getPreviousCategories(req, res, { categoriesCol, username }) {
  try {
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);

    // Get the current month's categories
    const currentCategoriesDocs = await categoriesCol
      .find({ username, month, year }, { name: 1, _id: 0 })
      .toArray();

    const currentCategories = currentCategoriesDocs.map(
      (category) => category.name,
    );

    // Get the name and color of all previous categories not currently in this month's categories
    const previousCategories = await categoriesCol
      .aggregate([
        { $match: { username, name: { $nin: currentCategories } } },
        { $group: { _id: { name: "$name", color: "$color" } } },
        { $project: { _id: 0, name: "$_id.name", color: "$_id.color" } },
      ])
      .toArray();

    return res.status(200).json(previousCategories);
  } catch (error) {
    console.error(
      `GET previous categories request failed for ${username}: ${error}`,
    );
    return res
      .status(500)
      .send(
        `An error occurred while getting the previous categories for ${username}`,
      );
  }
}
