import path from "path";
import fs from "fs";

const { promisify } = require('util');
const readFile = promisify(fs.readFile);

export default async function handler(req, res) {
    const month = req?.query?.month;
    const method = req?.method;
    const fileName = path.resolve("./public/db/", "transactions.json");

    const fileData = await readFile(fileName);
    const transactions = JSON.parse(fileData).transactions;
    const monthTransactions = transactions[month];

    if (method === "GET") {
        try {
            if (!monthTransactions) {
                res.status(400).send("Error: Request failed with status code 4040");
            } else {
                console.log("GET /api/transactions status: 200");
                res.status(200).send(JSON.stringify(monthTransactions, null, 2));
            }
        } catch (err) {
            console.log("Error with get request: ", err);
        }
    }
}