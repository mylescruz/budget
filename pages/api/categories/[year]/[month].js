const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

const defaultCategoriesFile = 'default_categories.json';

export default async function handler(req, res) {
    const month = req?.query?.month.toLowerCase();
    const year = req?.query?.year;
    const method = req?.method;
    const userFolder = 'mylescruz';
    const key = `${userFolder}/categories/${year}/${month}.json`;

    async function getCategoriesData() {
        const getParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            const categoriesData = await s3.getObject(getParams).promise();
            return JSON.parse(categoriesData.Body.toString('utf-8'));
        } catch(err) {
            if (err.code === 'NoSuchKey') {
                const defaultKey = `${userFolder}/categories/${defaultCategoriesFile}`;

                const getDefaultParams = {
                    Bucket: BUCKET,
                    Key: defaultKey
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

            console.log(`GET /api/categories/${year}/${month} status: 200`);
            res.status(200).send(JSON.stringify(categories, null, 2));
        } catch (err) {
            console.log("Error with get categories request: ", err);
            res.status(404).send("Error: GET request failed with status code 404");
        }
    } else if (method === "POST") {
        try {
            const newCategory = req?.body;
            const categories = await getCategoriesData();
            const updatedCategories = [...categories, newCategory];

            const postParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedCategories, null, 2),
                ContentType: "application/json"
            };

            await s3.putObject(postParams).promise();
            
            console.log(`POST /api/categories/${year}/${month} status: 200`);
            res.status(200).json(newCategory);
        } catch (err) {
            console.log("Error with POST categories request: ", err);
            res.status(404).send("Error: POST request failed with status code 404");
        }
    } else if (method === "PUT") {
        try {
            const edittedCategories = req?.body;

            const putParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(edittedCategories, null, 2),
                ContentType: "application/json"
            };

            await s3.putObject(putParams).promise();

            console.log(`PUT /api/categories/${year}/${month} status: 200`);
            res.status(200).json(edittedCategories);
        } catch (err) {
            console.log("Error with PUT categories request: ", err);
            res.status(404).send("Error: PUT request failed with status code 404");
        }
    } else if (method === "DELETE") {
        try {
            const categoryToDelete = req?.body;
            const categories = await getCategoriesData();

            const updatedCategories = categories.filter(category => {
                return category.id !== categoryToDelete.id;
            });

            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedCategories, null, 2),
                ContentType: "application/json"
            };
            
            await s3.putObject(deleteParams).promise();
            
            console.log(`DELETE /api/categories/${year}/${month} status: 200`);
            res.status(200).json(categoryToDelete);
        } catch (err) {
            console.log("Error with DELETE category request: ", err);
            res.status(404).send("Error: DELETE request failed with status code 404");
        }
    } else {
        res.status(405).end(`Method ${method} not allowed`);
    }
}