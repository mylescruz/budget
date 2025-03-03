// API Endpoint for a user's paystubs data

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

    const year = req?.query?.year;
    const method = req?.method;

    // S3 key for the location of the user's categories file
    const key = `${username}/paystubs/paystubs-${username}-${year}.json`;

    // Function that returns the user's paystubs from S3
    async function getPaystubData() {
        // Paystubs file parameters for S3
        const getParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            // Get the paystubs data from S3
            const paystubs = await s3.getObject(getParams).promise();
            return JSON.parse(paystubs.Body.toString('utf-8'));
        } catch (err) {
            if (err.code === 'NoSuchKey') {
                // Create a paystub file if a user doesn't have one already

                const newPaystubs = [];

                // Paystubs file parameters for S3
                const createFileParams = {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: JSON.stringify(newPaystubs, null, 2),
                    ContentType: "application/json"
                };

                // Place new paystubs file in the user's folder in S3
                await s3.putObject(createFileParams).promise();

                return newPaystubs;
            } else {
                console.error("Error retrieving transactions from S3: ", err);
                return null;
            }
        }
    }

    if (method === "GET") {
        // Return the user's paystubs from S3
        try {
            const paystubs = await getPaystubData();

            // Send the paystubs array in the response
            res.status(200).send(paystubs);
        } catch (err) {
            console.log("Error with GET paystubs request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "POST") {
        // Add the new paystub to the user's paystubs in S3
        try {
            const newPaystub = req?.body;
            const paystubs = await getPaystubData();
            const updatedPaystubs = [...paystubs, newPaystub];
            
            // Paystubs with added paystub file parameters for S3
            const postParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedPaystubs, null, 2),
                ContentType: "application/json"
            };

            // Place updated paystubs file in the user's folder in S3
            await s3.putObject(postParams).promise();

            // Send the updated paystubs array in the response
            res.status(200).json(updatedPaystubs);
        } catch (err) {
            console.log("Error with POST paystubs request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "PUT") {
        // Update a paystub in S3
        try {
            const edittedPaystub = req?.body;
            const paystubs = await getPaystubData();

            // Replace the current paystub with editted paystub
            const updatedPaystubs = paystubs.map(paystub => {
                if (paystub.id === edittedPaystub.id)
                    return edittedPaystub;
                else
                    return paystub;
            });

            // Updated paystubs file parameters for S3
            const putParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedPaystubs, null, 2),
                ContentType: "application/json"
            };

            // Place updated paystubs file in the user's folder in S3
            await s3.putObject(putParams).promise();

            // Send the updated paystubs array in the response
            res.status(200).json(updatedPaystubs);
        } catch (err) {
            console.log("Error with PUT paystubs request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "DELETE") {
        // Delete the given paystub from the user's paystubs in S3
        try {
            const paystubToDelete = req?.body;
            const paystubs = await getPaystubData();

            // Remove the given paystub from the paystubs array
            const updatedPaystubs = paystubs.filter(paystub => {
                return paystub.id !== paystubToDelete.id;
            });

            // Paystubs with the deleted paystub file parameters for S3
            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedPaystubs, null, 2),
                ContentType: "application/json"
            };

            // Place updated paystubs file in the user's folder in S3
            await s3.putObject(deleteParams).promise();

            // Send the updated paystubs array in the response
            res.status(200).json(updatedPaystubs);
        } catch (err) {
            console.log("Error with DELETE paystubs request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else {
        res.status(405).send(`Method ${method} not allowed`);
    }
}