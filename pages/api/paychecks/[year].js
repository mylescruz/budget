// API Endpoint for a user's paychecks data

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  const username = session.user.username;

  const year = parseInt(req?.query?.year);
  const method = req?.method;

  // Configure MongoDB
  const db = (await clientPromise).db(process.env.MONGO_DB);
  const paychecksCol = db.collection("paychecks");

  // Fucntion that returns the user's paychecks from MongoDB
  const getPaychecks = async () => {
    const docs = await paychecksCol
      .find({ username: username, year: year })
      .sort({ date: 1 })
      .toArray();

    const paychecks = docs.map((paycheck) => {
      return {
        id: paycheck._id,
        date: paycheck.date,
        company: paycheck.company,
        description: paycheck.description,
        gross: paycheck.gross,
        taxes: paycheck.taxes,
        net: paycheck.net,
      };
    });

    return paychecks;
  };

  if (method === "GET") {
    try {
      const paychecks = await getPaychecks();

      // Send the paychecks array in the response
      res.status(200).json(paychecks);
    } catch (error) {
      console.error(`${method} paychecks request failed: ${error}`);
      res.status(500).send(`Error occurred while getting ${username}'s income`);
    }
  } else if (method === "POST") {
    try {
      const paycheckBody = req?.body;

      // Define the identifiers from the paycheck
      const paycheckDate = new Date(paycheckBody.date);
      const month = paycheckDate.getMonth() + 1;
      const year = paycheckDate.getFullYear();

      // Assign the identifiers to the paycheck
      const newPaycheck = {
        username: username,
        month: month,
        year: year,
        ...paycheckBody,
      };

      // Add the new paycheck to the paychecks collection in MongoDB
      const result = await paychecksCol.insertOne(newPaycheck);

      // Send the new paycheck back to the client
      res.status(200).json({ id: result.insertedId, ...paycheckBody });
    } catch (error) {
      console.error(`${method} paychecks request failed: ${error}`);
      res.status(500).send("Error occured while adding a paycheck");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
