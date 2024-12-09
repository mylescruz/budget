import path from "path";
import fs from "fs";

const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

export default async function handler(req, res) {
    const month = req?.query?.month.toLowerCase();
    const year = req?.query?.year;
    const method = req?.method;
    const userFolder = 'mylescruz';
    const fileName = path.resolve(`./public/db/transactions/${year}/`, `${month}.json`);

    async function getTransactionData() {
        let key = `${userFolder}/transactions/${year}/${month}.json`;

        const getParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            const transactions = await s3.getObject(getParams).promise();
            return JSON.parse(transactions.Body.toString('utf-8'));
        } catch(err) {
            if (err.code === 'NoSuchKey') {
                const newTransactions = [];
                const createFileParams = {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: JSON.stringify(newTransactions, null, 2),
                    ContentType: "application/json"
                };
                await s3.putObject(createFileParams).promise();
                return newTransactions;
            } else {
                console.error("Error retrieving transactions from S3: ", err);
            }
        }
    }

    if (method === "GET") {
        try {
            const transactions = await getTransactionData();

            if (!transactions) {
                res.status(400).send("Error: Request failed with status code 404");
            } else {
                console.log(`GET /api/transactions/${year}/${month} status: 200`);
                res.status(200).send(JSON.stringify(transactions, null, 2));
            }
        } catch (err) {
            console.log("Error with get transactions request: ", err);
        }
    } else if (method === "POST") {
        try {
            const transaction = req?.body;
            const transactions = await getTransactionData();

            let updatedTransactions = [];
            if (!transactions)
                updatedTransactions = [transaction];
            else
                updatedTransactions = [...transactions, transaction];
            
            writeFile(fileName, JSON.stringify(updatedTransactions, null, 2));

            console.log(`POST /api/transactions/${year}/${month} status: 200`);
            res.status(200).json(transaction);
        } catch (err) {
            console.log("Error with post transactions request: ", err);
        }
    } else if (method === "PUT") {
        try {
            const edittedTransaction = req?.body;
            const transactions = await getTransactionData();

            if (!transactions)
                res.status(400).send("Error: Request failed with status code 404: No transactions to update");

            const updatedTransactions = transactions.map(transaction => {
                if (transaction.id === edittedTransaction.id)
                    return edittedTransaction;
                else
                    return transaction;
            });
            
            writeFile(fileName, JSON.stringify(updatedTransactions, null, 2));

            console.log(`PUT /api/transactions/${year}/${month} status: 200`);
            res.status(200).json(edittedTransaction);
        } catch (err) {
            console.log("Error with put transactions request: ", err);
        }
    } else if (method === "DELETE") {
        try {
            const transactionToDelete = req?.body;
            const transactions = await getTransactionData();

            if (!transactions)
                res.status(400).send("Error: Request failed with status code 404: No transactions to delete from");

            const updatedTransactions = transactions.filter(transaction => {
                return transaction.id !== transactionToDelete.id;
            });
            
            writeFile(fileName, JSON.stringify(updatedTransactions, null, 2));

            console.log(`DELETE /api/transactions/${year}/${month} status: 200`);
            res.status(200).json(transactionToDelete);
        } catch (err) {
            console.log("Error with delete transactions request: ", err);
        }
    } else {
        res.status(405).end(`Method ${method} not allowed`);
    }
}