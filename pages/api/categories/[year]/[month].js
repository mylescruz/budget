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
const BUCKET = process.env.BUCKET_NAME;

export default async function handler(req, res) {
    const month = req?.query?.month.toLowerCase();
    const year = req?.query?.year;
    const method = req?.method;
    const fileName = path.resolve(`./public/db/categories/${year}/`, `${month}.json`);

    async function getCategoriesData() {
        let key = `mylescruz/categories/${year}/${month}.json`;

        const getParams = {
            Bucket: BUCKET,
            Key: key
        };

        try {
            const categoriesData = await s3.getObject(getParams).promise();
            return JSON.parse(categoriesData.Body.toString('utf-8'));
        } catch(err) {
            if (err.code === 'NoSuchKey') {
                key = `mylescruz/categories/default.json`;

                const getDefaultParams = {
                    Bucket: BUCKET,
                    Key: key
                };

                const defaultCategories = await s3.getObject(getDefaultParams).promise();
                return JSON.parse(defaultCategories.Body.toString('utf-8'));
            } else {
                console.error("Error retrieving the categories data from S3: ", err);
            }
        }
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
            const updatedCategories = [...categories, newCategory];

            const key = `mylescruz/categories/${year}/${month}.json`;
            const postParams = {
                Bucket: BUCKET,
                Key: key,
                Body: JSON.stringify(updatedCategories, null, 2),
                ContentType: "application/json"
            };

            try {
                await s3.putObject(postParams).promise();
            } catch(err) {
                console.error("Error posting category data to S3: ", err);
            }
            
            console.log(`POST /api/categories/${year}/${month} status: 200`);
            res.status(200).json(newCategory);
        } catch (err) {
            console.log("Error with post categories request: ", err);
        }
    } else if (method === "PUT") {
        try {
            const edittedCategories = req?.body;

            const key = `mylescruz/categories/${year}/${month}.json`;
            const putParams = {
                Bucket: BUCKET,
                Key: key,
                Body: JSON.stringify(edittedCategories, null, 2),
                ContentType: "application/json"
            };

            try {
                await s3.putObject(putParams).promise();
            } catch(err) {
                console.error("Error putting category data to S3: ", err);
            }

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
            
            writeFile(fileName,JSON.stringify(updatedCategories, null, 2));
            
            console.log(`DELETE /api/categories/${year}/${month} status: 200`);
            res.status(200).json(categoryToDelete);
        } catch (err) {
            console.log("Error with delete category request: ", err);
        }
    } else {
        res.status(405).end(`Method ${method} not allowed`);
    }
}