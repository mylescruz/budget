// API Endpoint for a user's income data

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

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
    return res.status(403).send("Access denied to this user's data");

  const year = req?.query?.year;
  const method = req?.method;

  // S3 key for the location of the user's categories file
  const key = `users/${username}/income/income-${username}-${year}.json`;

  // Function that returns the user's income from S3
  async function getIncomeData() {
    // S3 File Parameters for the user's income
    const incomeParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      // Get the income data from S3
      const incomeData = await S3.send(new GetObjectCommand(incomeParams));
      return await streamToJSON(incomeData.Body);
    } catch (error) {
      if (error.name === "NoSuchKey") {
        // Create an income file if a user doesn't have one already

        const newIncome = [];

        // S3 File Parameters for the new user's income
        const newIncomeParams = {
          Bucket: BUCKET_NAME,
          Key: key,
          Body: JSON.stringify(newIncome, null, 2),
          ContentType: "application/json",
        };

        // Place new income file in the user's folder in S3
        await S3.send(new PutObjectCommand(newIncomeParams));

        return newIncome;
      } else {
        console.error("Error retrieving transactions from S3: ", error);
        return null;
      }
    }
  }

  if (method === "GET") {
    // Return the user's income from S3
    try {
      const income = await getIncomeData();

      // Send the income array in the response
      res.status(200).json(income);
    } catch (error) {
      console.error(`${method} income request failed: ${error}`);
      res.status(500).send(`Error occurred while getting ${username}'s income`);
    }
  } else if (method === "POST") {
    // Add the new paycheck to the user's income in S3
    try {
      const paycheckBody = req?.body;

      // Assign an id to the new paycheck
      const newPaycheck = { id: uuidv4(), ...paycheckBody };

      const income = await getIncomeData();

      // Add the new paycheck to the income array
      const updatedIncome = [...income, newPaycheck];

      // S3 File Parameters for the user's updated income
      const incomeParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(updatedIncome, null, 2),
        ContentType: "application/json",
      };

      // Place updated income file in the user's folder in S3
      await S3.send(new PutObjectCommand(incomeParams));

      // Send the new paycheck in the response
      res.status(200).json(newPaycheck);
    } catch (error) {
      console.error(`${method} income request failed: ${error}`);
      res.status(500).send("Error occured while adding a paycheck");
    }
  } else if (method === "PUT") {
    // Update a paycheck in S3
    try {
      const edittedPaycheck = req?.body;
      const income = await getIncomeData();

      // Replace the current paycheck with editted paycheck
      const updatedIncome = income.map((paycheck) => {
        if (paycheck.id === edittedPaycheck.id) {
          return edittedPaycheck;
        } else {
          return paycheck;
        }
      });

      // S3 File Parameters for the user's updated income
      const incomeParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(updatedIncome, null, 2),
        ContentType: "application/json",
      };

      // Place updated income file in the user's folder in S3
      await S3.send(new PutObjectCommand(incomeParams));

      // Send the updated paycheck in the response
      res.status(200).json(edittedPaycheck);
    } catch (error) {
      console.error(`${method} income request failed: ${error}`);
      res.status(500).send("Error occurred while editting a paycheck");
    }
  } else if (method === "DELETE") {
    // Delete the given paycheck from the user's income in S3
    try {
      const paycheckToDelete = req?.body;
      const income = await getIncomeData();

      // Remove the given paycheck from the income array
      const updatedIncome = income.filter((paycheck) => {
        return paycheck.id !== paycheckToDelete.id;
      });

      // S3 File Parameters for the user's updated income
      const incomeParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(updatedIncome, null, 2),
        ContentType: "application/json",
      };

      // Place updated income file in the user's folder in S3
      await S3.send(new PutObjectCommand(incomeParams));

      // Send the deleted paycheck in the response
      res.status(200).json(paycheckToDelete);
    } catch (err) {
      console.error(`${method} income request failed: ${err}`);
      res.status(500).send("Error occurred while deleting a paycheck");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
