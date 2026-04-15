import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import centsToDollars from "@/helpers/centsToDollars";
import { logError } from "@/lib/logError";

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
  const incomeCol = db.collection("income");

  if (method === "GET") {
    try {
      // Get all the sources of income for the given month
      const income = await incomeCol
        .find(
          { username: username, month: month, year: year },
          { maxTimeMS: 5000 },
        )
        .toArray();

      if (income.length === 0) {
        return res.status(200).send(0);
      }

      // Get the total income for the given month
      const monthIncome = centsToDollars(
        income.reduce((sum, current) => sum + current.amount, 0),
      );

      // Send the income for the month back to the client
      return res.status(200).send(monthIncome);
    } catch (error) {
      await logError({ error, req, username });

      return res
        .status(500)
        .send(
          "We're unable to load this month's income at the moment. Please try again later!",
        );
    }
  } else {
    return res.status(405).send(`${method} method is not allowed`);
  }
}
