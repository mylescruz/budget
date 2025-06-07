// API Endpoint for a user's transactions data

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
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

// Function to convert the stream object from S3 to JSON
const streamToJSON = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf-8");
        const data = JSON.parse(body);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
    stream.on("error", (err) => {
      reject(err);
    });
  });
};

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) return res.status(401).send("Must login to view your data!");

  const username = req?.query?.username;

  // If a user tries to directly access a different user's data, send an error message
  if (session.user.username !== username)
    return res.status(401).send("Access denied to this user's data");

  const month = req?.query?.month.toLowerCase();
  const year = req?.query?.year;
  const method = req?.method;

  // S3 key for the file's location
  const key = `users/${username}/transactions/${year}/transactions-${username}-${month}${year}.json`;

  // Function that returns the user's transactions from S3
  async function getTransactionData() {
    // S3 File Parameters for the user's transactions
    const transactionsParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      // Get the transactions data from S3
      const transactionsData = await S3.send(
        new GetObjectCommand(transactionsParams)
      );
      return await streamToJSON(transactionsData.Body);
    } catch (error) {
      if (error.name === "NoSuchKey") {
        // Create a transactions file if a user doesn't have one already
        const newTransactions = [];

        // S3 File Parameters for the new user's transactions
        const newTransactionsParams = {
          Bucket: BUCKET_NAME,
          Key: key,
          Body: JSON.stringify(newTransactions, null, 2),
          ContentType: "application/json",
        };

        // Place new transactions file in the user's folder in S3
        await S3.send(new PutObjectCommand(newTransactionsParams));

        return newTransactions;
      } else {
        console.error("Error retrieving transactions from S3: ", error);
        return null;
      }
    }
  }

  if (method === "GET") {
    // Return the user's transactions from S3
    try {
      const transactions = await getTransactionData();

      // Send the transactions array in the response
      res.status(200).json(transactions);
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res
        .status(500)
        .send(`Error occurred while getting ${username}'s transactions`);
    }
  } else if (method === "POST") {
    // Add the new transaction to the user's transactions in S3
    try {
      const newTransaction = req?.body;
      const transactions = await getTransactionData();

      // Add new transaction to the transactions array
      const updatedTransactions = [...transactions, newTransaction];

      // S3 File Parameters for the user's updated transactions
      const transactionsParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(updatedTransactions, null, 2),
        ContentType: "application/json",
      };

      // Place updated transactions file in the user's folder in S3
      await S3.send(new PutObjectCommand(transactionsParams));

      // Send the new transaction in the response
      res.status(200).json(newTransaction);
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res.status(500).send("Error occurred while adding a transaction");
    }
  } else if (method === "PUT") {
    // Update a user's transaction in S3
    try {
      const edittedTransaction = req?.body;
      const transactions = await getTransactionData();

      // Replace the current transaction with the editted transaction in the transactions array
      const updatedTransactions = transactions.map((transaction) => {
        if (transaction.id === edittedTransaction.id) return edittedTransaction;
        else return transaction;
      });

      // S3 File Parameters for the user's updated transactions
      const transactionsParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(updatedTransactions, null, 2),
        ContentType: "application/json",
      };

      // Place updated transactions file in the user's folder in S3
      await S3.send(new PutObjectCommand(transactionsParams));

      // Send the editted transaction in the response
      res.status(200).json(edittedTransaction);
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res.status(500).send("Error occurred while editting a transaction");
    }
  } else if (method === "DELETE") {
    // Delete the given transaction from the user's transactions in S3
    try {
      const transactionToDelete = req?.body;
      const transactions = await getTransactionData();

      // Remove the given transaction from the transactions array
      const updatedTransactions = transactions.filter((transaction) => {
        return transaction.id !== transactionToDelete.id;
      });

      // S3 File Parameters for the user's updated transactions
      const transactionsParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(updatedTransactions, null, 2),
        ContentType: "application/json",
      };

      // Place updated transactions file in the user's folder in S3
      await S3.send(new PutObjectCommand(transactionsParams));

      // Send the deleted transaction in the response
      res.status(200).json(transactionToDelete);
    } catch (error) {
      console.error(`${method} transactions request failed: ${error}`);
      res.status(500).send("Error occurred while deleting a transaction");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
