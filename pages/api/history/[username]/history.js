// API Endpoint for a user's history data

import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

// Configuring AWS SDK to connect to Amazon S3
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

export default async function handler(req, res) {
    // Using NextAuth.js to authenticate a user's session in the server
    const session = await getServerSession(req, res, authOptions);

    // If there is no session, send an error message
    if (!session)
        return res.status(401).send("Must login to view your data!");

    const username = req?.query?.username;

    // If a user tries to directly access a different user's data, send an error message
    if (session.user.username !== username)
        return res.status(403).send("Access denied to this user's data");

    const method = req?.method;

    // S3 key for the file's location
    const key = `${username}/history/history-${username}.json`;

    // Function that returns the user's history from S3
    async function getHistoryData() {
        // History file parameters for S3
        const getParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            // Get the history data from S3
            const history = await s3.getObject(getParams).promise();
            return JSON.parse(history.Body.toString('utf-8'));
        } catch (err) {
            if (err.code === 'NoSuchKey') {
                // Create a history file if a user doesn't have one already
                const newHistory = [];

                // History file parameters for S3
                const createFileParams = {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: JSON.stringify(newHistory, null, 2),
                    ContentType: "application/json"
                };

                // Place new history file in the user's folder in S3
                await s3.putObject(createFileParams).promise();
                
                return newHistory;
            } else {
                console.error("Error retrieving the user's history from S3: ", err);
                return null;
            }
        }
    }

    if (method === "GET") {
        // Return the user's history from S3
        try {
            const history = await getHistoryData();

            // Send the history array in the response
            res.status(200).send(history);
        } catch (err) {
            console.error("Error with GET history request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "POST") {
        // Add the new month to the user's history in S3
        try {
            const newHistory = req?.body;
            const history = await getHistoryData();
            const updatedHistory = [...history, newHistory];

            // History with added month file parameters for S3
            const postParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedHistory, null, 2),
                ContentType: "application/json"
            };

            // Place updated history file in the user's folder in S3
            await s3.putObject(postParams).promise();
            
            // Send the updated history array in the response
            res.status(200).json(updatedHistory);
        } catch (err) {
            console.error("Error with POST history request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "PUT") {
        // Update a user's history for a given month in S3
        try {
            const edittedHistory = req?.body;
            const history = await getHistoryData();

            // Replace the history's current month with the editted month
            const updatedHistory = history.map(currentHistory => {
                if (currentHistory.id === edittedHistory.id)
                    return edittedHistory;
                else
                    return currentHistory;
            });

            // Updated history file parameters for S3
            const putParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedHistory, null, 2),
                ContentType: "application/json"
            };

            // Place updated history file in the user's folder in S3
            await s3.putObject(putParams).promise();

            // Send the updated history array in the response
            res.status(200).json(updatedHistory);
        } catch (err) {
            console.error("Error with PUT history request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "DELETE") {
        // Delete the given month from the user's history in S3
        try {
            const historyToDelete = req?.body;
            const history = await getHistoryData();

            // Remove the given month from the history array
            const updatedHistory = history.filter(currentHistory => {
                return currentHistory.id !== historyToDelete.id;
            });

            // History with deleted month file parameters for S3
            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedHistory, null, 2),
                ContentType: "application/json"
            };
            
            // Place updated history file in the user's folder in S3
            await s3.putObject(deleteParams).promise();
            
            // Send the updated history array in the response
            res.status(200).json(updatedHistory);
        } catch (err) {
            console.error("Error with DELETE history request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else {
        res.status(405).send(`Method ${method} not allowed`);
    }
}