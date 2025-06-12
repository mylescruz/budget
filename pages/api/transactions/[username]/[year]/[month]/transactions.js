// API Endpoint for a user's transactions data

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";

// Configuring AWS SDK to connect to Amazon S3
const S3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET_NAME = process.env.BUCKET_NAME;

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) return res.status(401).send("Must login to view your data!");

  const username = req?.query?.username.toLowerCase();

  // If a user tries to directly access a different user's data, send an error message
  if (session.user.username !== username)
    return res.status(401).send("Access denied to this user's data");

  const month = req?.query?.month;
  const year = req?.query?.year;
  const method = req?.method;

  // S3 key for the file's location
  const key = `users/${username}/transactions/${year}/${month}${year}.json`;

  if (method === "PUT") {
    // Update a user's transaction in S3
    try {
      const updatedTransactions = req?.body;

      // S3 File Parameters for the user's updated transactions
      const transactionsParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(updatedTransactions, null, 2),
        ContentType: "application/json",
      };

      // Place updated transactions file in the user's folder in S3
      await S3.send(new PutObjectCommand(transactionsParams));

      // Send the updated transactions array in the response
      res.status(200).json(updatedTransactions);
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res.status(500).send("Error occurred while editting a transaction");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
