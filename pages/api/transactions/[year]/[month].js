import path from "path";
import fs from "fs";

const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export default async function handler(req, res) {
    const month = req?.query?.month;
    const year = req?.query?.year;
    const method = req?.method;
    const fileName = path.resolve(`./public/db/transactions/${year}/`, `${month}.json`);

    async function getTransactionData() {
        const fileData = await readFile(fileName);
        const transactions = JSON.parse(fileData);
        return transactions;
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
            
            writeFile(
                fileName,
                JSON.stringify(updatedTransactions, null, 2)
            )
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

            // const updatedTransactions = {};
            // updatedTransactions[month] = updated;
            
            writeFile(
                fileName,
                JSON.stringify(updatedTransactions, null, 2)
            )
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

            // const updatedTransactions = {};
            // updatedTransactions[month] = updated;
            
            writeFile(
                fileName,
                JSON.stringify(updatedTransactions, null, 2)
            )
            console.log(`DELETE /api/transactions/${year}/${month} status: 200`);
            res.status(200).json(transactionToDelete);
        } catch (err) {
            console.log("Error with delete transactions request: ", err);
        }
    } else {
        res.status(405).end(`Method ${method} not allowed`);
    }
}