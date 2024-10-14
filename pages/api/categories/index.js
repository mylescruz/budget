import path from "path";
import fs from "fs";

const { promisify } = require('util');
const readFile = promisify(fs.readFile);

export default async function handler(req, res) {
    const method = req?.method;
    const fileName = path.resolve("./public/db/", "categories.json");

    const fileData = await readFile(fileName);
    const categories = JSON.parse(fileData).categories;
    
    if (method === "GET") {
        try {
            if (!categories) {
                res.status(400).send("Error: Request failed with status code 4040");
            } else {
                console.log("GET /api/categories status: 200");
                res.status(200).send(JSON.stringify(categories, null, 2));
            }
        } catch (err) {
            console.log("Error with get request: ", err);
        }
    }
}