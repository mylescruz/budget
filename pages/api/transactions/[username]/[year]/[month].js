// API Endpoint for a user's transactions data

import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';

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
        return res.status(401).send("Access denied to this user's data");

    const month = req?.query?.month.toLowerCase();
    const year = req?.query?.year;
    const method = req?.method;

    // S3 key for the file's location
    const key = `${username}/transactions/${year}/transactions-${username}-${month}${year}.json`;

    // Function that returns the user's transactions from S3
    async function getTransactionData() {
        // Transactions file parameters for S3
        const getParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            // Get the transactions data from S3
            const transactions = await s3.getObject(getParams).promise();
            return JSON.parse(transactions.Body.toString('utf-8'));
        } catch(err) {
            if (err.code === 'NoSuchKey') {
                // Create a transactions file if a user doesn't have one already
                const newTransactions = [];

                // Transactions file parameters for S3
                const createFileParams = {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: JSON.stringify(newTransactions, null, 2),
                    ContentType: "application/json"
                };

                // Place new transactions file in the user's folder in S3
                await s3.putObject(createFileParams).promise();

                return newTransactions;
            } else {
                console.error("Error retrieving transactions from S3: ", err);
                return null;
            }
        }
    }

    if (method === "GET") {
        // Return the user's transactions from S3
        try {
            const transactions = await getTransactionData();

            // Send the transactions array in the response
            res.status(200).send(transactions);
        } catch (err) {
            console.log("Error with GET transactions request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "POST") {
        // Add the new transaction to the user's transactions in S3
        try {
            const newTransaction = req?.body;
            const transactions = await getTransactionData();

            const updatedTransactions = [...transactions, newTransaction];

            // Transactions with added transaction file parameters for S3
            const postParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedTransactions, null, 2),
                ContentType: "application/json"
            };
    
            // Place updated transactions file in the user's folder in S3
            await s3.putObject(postParams).promise();

            // Send the updated transactions array in the response
            res.status(200).json(updatedTransactions);
        } catch (err) {
            console.log("Error with POST transactions request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "PUT") {
        // Update a user's transaction in S3
        try {
            const edittedTransaction = req?.body;
            const transactions = await getTransactionData();

            // Replace the current transaction with the editted transaction in the transactions array
            const updatedTransactions = transactions.map(transaction => {
                if (transaction.id === edittedTransaction.id)
                    return edittedTransaction;
                else
                    return transaction;
            });

            // Updated transactions file parameters for S3
            const putParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedTransactions, null, 2),
                ContentType: "application/json"
            };
    
            // Place updated transactions file in the user's folder in S3
            await s3.putObject(putParams).promise();

            // Send the updated transactions array in the response
            res.status(200).json(updatedTransactions);
        } catch (err) {
            console.log("Error with PUT transactions request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "DELETE") {
        // Delete the given transaction from the user's transactions in S3
        try {
            const transactionToDelete = req?.body;
            const transactions = await getTransactionData();

            // Remove the given transaction from the transactions array
            const updatedTransactions = transactions.filter(transaction => {
                return transaction.id !== transactionToDelete.id;
            });

            // Transactions with deleted transaction file parameters for S3
            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedTransactions, null, 2),
                ContentType: "application/json"
            };
    
            // Place updated transactions file in the user's folder in S3
            await s3.putObject(deleteParams).promise();

            // Send the updated transactions array in the response
            res.status(200).json(updatedTransactions);
        } catch (err) {
            console.log("Error with DELETE transactions request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else {
        res.status(405).send(`Method ${method} not allowed`);
    }
}