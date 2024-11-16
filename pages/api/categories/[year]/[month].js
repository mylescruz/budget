import path from "path";
import fs from "fs";

const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export default async function handler(req, res) {
    const month = req?.query?.month;
    const year = req?.query?.year;
    const method = req?.method;
    const fileName = path.resolve(`./public/db/categories/${year}/`, `${month}.json`);

    async function getCategoriesData() {
        const fileData = await readFile(fileName);
        const categories = JSON.parse(fileData);
        return categories;
    }
    
    if (method === "GET") {
        try {
            const categories = await getCategoriesData();

            if (!categories) {
                res.status(400).send("Error: Request failed with status code 404");
            } else {
                console.log(`GET /api/categories/${year}/${month} status: 200`);
                res.status(200).send(JSON.stringify(categories, null, 2));
            }
        } catch (err) {
            console.log("Error with get categories request: ", err);
        }
    } else if (method === "POST") {
        try {
            const newCategory = req?.body;
            const categories = await getCategoriesData();

            let updatedCategories = [];
            if (!categories)
                updatedCategories = [newCategory];
            else
                updatedCategories = [...categories, newCategory];

            writeFile(
                fileName,
                JSON.stringify({
                    categories: updatedCategories
                }, null, 2)
            )
            console.log(`POST /api/categories/${year}/${month} status: 200`);
            res.status(200).json(newCategory);
        } catch (err) {
            console.log("Error with post categories request: ", err);
        }
    } else if (method === "PUT") {
        try {
            const edittedCategories = req?.body;
            // const updatedCategories = {};
            // updatedCategories[month] = edittedCategories;

            writeFile(
                fileName,
                JSON.stringify(edittedCategories, null, 2)
            )
            console.log(`PUT /api/categories/${year}/${month} status: 200`);
            res.status(200).json(edittedCategories);
        } catch (err) {
            console.log("Error with put categories request: ", err);
        }
    } else if (method === "DELETE") {
        try {
            const categoryToDelete = req?.body;
            const categories = await getCategoriesData();

            if (!categories)
                res.status(400).send("Error: Request failed with status code 404: No categories to delete from");

            const updatedCategories = categories.filter(category => {
                return category.id !== categoryToDelete.id;
            });

            // const updatedCategories = {};
            // updatedCategories[month] = updated;
            
            writeFile(
                fileName,
                JSON.stringify(updatedCategories, null, 2)
            )
            console.log(`DELETE /api/categories/${year}/${month} status: 200`);
            res.status(200).json(categoryToDelete);
        } catch (err) {
            console.log("Error with delete category request: ", err);
        }
    } else {
        res.status(405).end(`Method ${method} not allowed`);
    }
}