import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  // Use NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).send("Must login to view your data");
  }

  const username = session.user.username;

  const method = req?.method;
  const month = parseInt(req?.query?.month);
  const year = parseInt(req?.query?.year);

  const db = (await clientPromise).db(process.env.MONGO_DB);
  const paychecksCol = db.collection("paychecks");

  if (method === "GET") {
    // Get all the paychecks for the given month
    const paychecks = await paychecksCol
      .find({ username: username, month: month, year: year })
      .toArray();

    if (paychecks.length === 0) {
      return res.status(200).send(0);
    }
    // Get the total net income for the given month
    const monthIncome = paychecks.reduce(
      (sum, current) => sum + current.net,
      0
    );

    // Send the income for the month back to the client
    return res.status(200).send(monthIncome);
  } else {
    console.error(`${method} method is not allowed`);
    return res.status(405).send(`${method} method is not allowed`);
  }
}
