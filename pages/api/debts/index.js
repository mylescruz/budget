import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { logError } from "@/lib/logError";

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
