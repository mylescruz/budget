const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

export default async function handler(req, res) {
    const year = req?.query?.year;
    const method = req?.method;
    const userFolder = 'mylescruz';
    const key = `${userFolder}/categories/${year}/summary.json`;

    async function getCategoriesSummary() {
        const getParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            const categoriesSummary = await s3.getObject(getParams).promise();
            return JSON.parse(categoriesSummary.Body.toString('utf-8'));
        } catch (err) {
            if (err.code === 'NoSuchKey') {
                console.log(`Creating a new summary file for ${year}`);

                const newSummary = [];

                const createFileParams = {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: JSON.stringify(newSummary, null, 2),
                    ContentType: "application/json"
                };

                await s3.putObject(createFileParams).promise();
                
                return newSummary;
            } else {
                console.error("Error retrieving the categories summary from S3: ", err);
            }
        }
    }

    if (method === "GET") {
        try {
            const summary = await getCategoriesSummary();

            console.log(`GET /api/category/${year}/summary status: 200`);
            res.status(200).send(JSON.stringify(summary, null, 2));
        } catch (err) {
            console.log("Error with GET summary request: ", err);
            res.status(400).send("Error: GET request failed with status code 404");
        }
    } else if (method === "POST") {
        try {
            const newSummary = req?.body;
            const summary = await getCategoriesSummary();
            const updatedSummary = [...summary, newSummary];

            const postParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedSummary, null, 2),
                ContentType: "application/json"
            };

            await s3.putObject(postParams).promise();
            
            console.log(`POST /api/categories/${year}/summary status: 200`);
            res.status(200).json(newCategory);
        } catch (err) {
            console.log("Error with POST summary request: ", err);
            res.status(404).send("Error: POST request failed with status code 404");
        }
    } else {
        res.status(405).end(`Method ${method} not allowed`);
    }
}