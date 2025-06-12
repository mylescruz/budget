// API Endpoint for a user's history data

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
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

  const method = req?.method;

  // S3 key for the file's location
  const key = `users/${username}/history/history-${username}.json`;

  // Function that returns the user's history from S3
  async function getHistoryData() {
    // S3 File Parameters for the user's history
    const historyParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      // Get the history data from S3
      const historyData = await S3.send(new GetObjectCommand(historyParams));
      return await streamToJSON(historyData.Body);
    } catch (error) {
      if (error.name === "NoSuchKey") {
        // Create a history file if a user doesn't have one already
        const newHistory = [];

        // S3 File Parameters for the user's new history
        const createHistoryParams = {
          Bucket: BUCKET_NAME,
          Key: key,
          Body: JSON.stringify(newHistory, null, 2),
          ContentType: "application/json",
        };

        // Place new history file in the user's folder in S3
        await S3.send(new PutObjectCommand(createHistoryParams));

        return newHistory;
      } else {
        console.error("Error retrieving the user's history from S3: ", error);
        return null;
      }
    }
  }

  if (method === "GET") {
    // Return the user's history from S3
    try {
      const history = await getHistoryData();

      // Send the history array in the response
      res.status(200).json(history);
    } catch (error) {
      console.error(`${method} history request failed: ${error}`);
      res
        .status(500)
        .send(`Error occurred while getting ${username}'s history`);
    }
  } else if (method === "POST") {
    // Add the new month to the user's history in S3
    try {
      const historyBody = req?.body;

      // Assign an id to the new history month
      const newHistory = { id: uuidv4(), ...historyBody };

      const history = await getHistoryData();
      const updatedHistory = [...history, newHistory];

      // S3 File Parameters for the user's updated history
      const historyParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(updatedHistory, null, 2),
        ContentType: "application/json",
      };

      // Place updated history file in the user's folder in S3
      await S3.send(new PutObjectCommand(historyParams));

      // Send the new history in the response
      res.status(200).json(newHistory);
    } catch (error) {
      console.error(`${method} history request failed: ${error}`);
      res.status(500).send("Error occurred while adding to the history");
    }
  } else if (method === "PUT") {
    // Update a user's history for a given month in S3
    try {
      const edittedHistory = req?.body;
      const history = await getHistoryData();

      // Replace the history's current month with the editted month
      const updatedHistory = history.map((currentHistory) => {
        if (currentHistory.id === edittedHistory.id) {
          return edittedHistory;
        } else {
          return currentHistory;
        }
      });

      // S3 File Parameters for the user's updated history
      const historyParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(updatedHistory, null, 2),
        ContentType: "application/json",
      };

      // Place updated history file in the user's folder in S3
      await S3.send(new PutObjectCommand(historyParams));

      // Send the updated history object in the response
      res.status(200).json(edittedHistory);
    } catch (error) {
      console.error(`${method} history request failed: ${error}`);
      res.status(500).send("Error occurred while editting the history");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
