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
    const key = `${userFolder}/transactions/${year}/${month}.json`;

    async function getTransactionData() {
        const getParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            const transactions = await s3.getObject(getParams).promise();
            return JSON.parse(transactions.Body.toString('utf-8'));
        } catch(err) {
            if (err.code === 'NoSuchKey') {
                console.log(`Creating a new transactions file for ${month}`);

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

            console.log(`GET /api/transactions/${year}/${month} status: 200`);
            res.status(200).send(JSON.stringify(transactions, null, 2));
        } catch (err) {
            console.log("Error with GET transactions request: ", err);
            res.status(404).send("Error: GET request failed with status code 404");
        }
    } else if (method === "POST") {
        try {
            const newTransaction = req?.body;
            const transactions = await getTransactionData();

            const updatedTransactions = [...transactions, newTransaction];

            const postParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedTransactions, null, 2),
                ContentType: "application/json"
            };
    
            await s3.putObject(postParams).promise();

            console.log(`POST /api/transactions/${year}/${month} status: 200`);
            res.status(200).json(newTransaction);
        } catch (err) {
            console.log("Error with POST transactions request: ", err);
            res.status(404).send("Error: POST request failed with status code 404");
        }
    } else if (method === "PUT") {
        try {
            const edittedTransaction = req?.body;
            const transactions = await getTransactionData();

            const updatedTransactions = transactions.map(transaction => {
                if (transaction.id === edittedTransaction.id)
                    return edittedTransaction;
                else
                    return transaction;
            });

            const putParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedTransactions, null, 2),
                ContentType: "application/json"
            };
    
            await s3.putObject(putParams).promise();

            console.log(`PUT /api/transactions/${year}/${month} status: 200`);
            res.status(200).json(edittedTransaction);
        } catch (err) {
            console.log("Error with PUT transactions request: ", err);
            res.status(404).send("Error: PUT request failed with status code 404");
        }
    } else if (method === "DELETE") {
        try {
            const transactionToDelete = req?.body;
            const transactions = await getTransactionData();

            const updatedTransactions = transactions.filter(transaction => {
                return transaction.id !== transactionToDelete.id;
            });

            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedTransactions, null, 2),
                ContentType: "application/json"
            };
    
            await s3.putObject(deleteParams).promise();

            console.log(`DELETE /api/transactions/${year}/${month} status: 200`);
            res.status(200).json(transactionToDelete);
        } catch (err) {
            console.log("Error with DELETE transactions request: ", err);
            res.status(404).send("Error: DELETE request failed with status code 404");
        }
    } else {
        res.status(405).end(`Method ${method} not allowed`);
    }
}