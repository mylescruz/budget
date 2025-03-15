// API Endpoint for a user's income data

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
    const key = `users/${username}/income/income-${username}-${year}.json`;

    // Function that returns the user's income from S3
    async function getIncomeData() {
        // Income file parameters for S3
        const getParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            // Get the income data from S3
            const income = await s3.getObject(getParams).promise();
            return JSON.parse(income.Body.toString('utf-8'));
        } catch (err) {
            if (err.code === 'NoSuchKey') {
                // Create an income file if a user doesn't have one already

                const newIncome = [];

                // Income file parameters for S3
                const createFileParams = {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: JSON.stringify(newIncome, null, 2),
                    ContentType: "application/json"
                };

                // Place new income file in the user's folder in S3
                await s3.putObject(createFileParams).promise();

                return newIncome;
            } else {
                console.error("Error retrieving transactions from S3: ", err);
                return null;
            }
        }
    }

    if (method === "GET") {
        // Return the user's income from S3
        try {
            const income = await getIncomeData();

            // Send the income array in the response
            res.status(200).send(income);
        } catch (err) {
            console.error(`${method} income request failed: ${err}`);
            res.status(500).send(`Error occurred while getting ${username}'s income`);
        }
    } else if (method === "POST") {
        // Add the new paycheck to the user's income in S3
        try {
            const newPaycheck = req?.body;
            const income = await getIncomeData();
            const updatedIncome = [...income, newPaycheck];
            
            // Income with added paycheck file parameters for S3
            const postParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedIncome, null, 2),
                ContentType: "application/json"
            };

            // Place updated income file in the user's folder in S3
            await s3.putObject(postParams).promise();

            // Send the updated income array in the response
            res.status(200).json(updatedIncome);
        } catch (err) {
            console.error(`${method} income request failed: ${err}`);
            res.status(500).send("Error occured while adding a paycheck");
        }
    } else if (method === "PUT") {
        // Update a paycheck in S3
        try {
            const edittedPaycheck = req?.body;
            const income = await getIncomeData();

            // Replace the current paycheck with editted paycheck
            const updatedIncome = income.map(paycheck => {
                if (paycheck.id === edittedPaycheck.id)
                    return edittedPaycheck;
                else
                    return paycheck;
            });

            // Updated income file parameters for S3
            const putParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedIncome, null, 2),
                ContentType: "application/json"
            };

            // Place updated income file in the user's folder in S3
            await s3.putObject(putParams).promise();

            // Send the updated income array in the response
            res.status(200).json(updatedIncome);
        } catch (err) {
            console.error(`${method} income request failed: ${err}`);
            res.status(500).send("Error occurred while editting a paycheck");
        }
    } else if (method === "DELETE") {
        // Delete the given paycheck from the user's income in S3
        try {
            const paycheckToDelete = req?.body;
            const income = await getIncomeData();

            // Remove the given paycheck from the income array
            const updatedIncome = income.filter(paycheck => {
                return paycheck.id !== paycheckToDelete.id;
            });

            // Income with the deleted paycheck file parameters for S3
            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedIncome, null, 2),
                ContentType: "application/json"
            };

            // Place updated income file in the user's folder in S3
            await s3.putObject(deleteParams).promise();

            // Send the updated income array in the response
            res.status(200).json(updatedIncome);
        } catch (err) {
            console.error(`${method} income request failed: ${err}`);
            res.status(500).send("Error occurred while deleting a paycheck");
        }
    } else {
        res.status(405).send(`Method ${method} not allowed`);
    }
}