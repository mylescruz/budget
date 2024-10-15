import path from "path";
import fs from "fs";

const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export default async function handler(req, res) {
    const method = req?.method;
    const fileName = path.resolve("./public/db/", "categories.json");

    const fileData = await readFile(fileName);
    const categories = JSON.parse(fileData).categories;
    
    if (method === "GET") {
        try {
            if (!categories) {
                res.status(400).send("Error: Request failed with status code 404");
            } else {
                console.log("GET /api/categories status: 200");
                res.status(200).send(JSON.stringify(categories, null, 2));
            }
        } catch (err) {
            console.log("Error with get categories request: ", err);
        }
    } else if (method === "POST") {
        try {
            const updatedCategories = req?.body;
            writeFile(
                fileName,
                JSON.stringify({
                    categories: updatedCategories
                }, null, 2)
            )
            console.log("POST /api/categories status: 200");
            res.status(200).json(updatedCategories);
        } catch (err) {
            console.log("Error with post categories request: ", err);
        }
    } else {
        res.status(405).end(`Method ${method} not allowed`);
    }
}