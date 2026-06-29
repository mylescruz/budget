import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";
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
    client: client,
    debtsCol: db.collection("debts"),
    username: authSession.user.username,
  };

  switch (req.method) {
    case "DELETE":
      return deleteDebt(req, res, debtsContext);
    default:
      res.status(405).send(`${req.method} method not allowed`);
  }
}

// Delete the selected debt for the user in MongoDB
async function deleteDebt(req, res, { client, debtsCol, username }) {
  const mongoSession = client.startSession();

  try {
    const debtId = req.query._id;

    await mongoSession.withTransaction(async (session) => {
      // Delete the given debt from MongoDB
      await debtsCol.deleteOne(
        { _id: new ObjectId(debtId) },
        { session, maxTimeMS: 5000 },
      );
    });

    return res
      .status(200)
      .json({ _id: debtId, message: "This debt was deleted successfully" });
  } catch (error) {
    await logError({ error, req, username });

    return res
      .status(500)
      .send(
        "We're unable to delete this debt at the moment. Please try again later!",
      );
  } finally {
    await mongoSession.endSession();
  }
}
