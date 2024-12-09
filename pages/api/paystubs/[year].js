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
    const year = req?.query?.year;
    const method = req?.method;
    const fileName = path.resolve(`./public/db/paystubs/`, `${year}.json`);
    const userFolder = 'mylescruz';
    const key = `${userFolder}/paystubs/${year}.json`;

    async function getPaystubData() {
        const getParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            const paystubs = await s3.getObject(getParams).promise();
            return JSON.parse(paystubs.Body.toString('utf-8'));
        } catch (err) {
            if (err.code === 'NoSuchKey') {
                console.log(`Creating a new paystubs file for ${year}`);

                const newPaystubs = [];
                const createFileParams = {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: JSON.stringify(newPaystubs, null, 2),
                    ContentType: "application/json"
                };
                await s3.putObject(createFileParams).promise();
                return newPaystubs;
            } else {
                console.error("Error retrieving transactions from S3: ", err);
            }
        }
    }

    if (method === "GET") {
        try {
            const paystubs = await getPaystubData();

            console.log(`GET /api/paystubs/${year} status: 200`);
            res.status(200).send(JSON.stringify(paystubs, null, 2));
        } catch (err) {
            console.log("Error with GET paystubs request: ", err);
            res.status(400).send("Error: GET request failed with status code 404");
        }
    } else if (method === "POST") {
        try {
            const paystub = req?.body;
            const paystubs = await getPaystubData();

            let updatedPaystubs = [];
            if (!paystubs)
                updatedPaystubs = [paystub];
            else
                updatedPaystubs = [...paystubs, paystub];
            
            writeFile(fileName, JSON.stringify(updatedPaystubs, null, 2));

            console.log(`POST /api/paystubs/${year} status: 200`);
            res.status(200).json(paystub);
        } catch (err) {
            console.log("Error with post paystubs request: ", err);
        }
    } else if (method === "PUT") {
        try {
            const edittedPaystub = req?.body;
            const paystubs = await getPaystubData();

            if (!paystubs)
                res.status(400).send("Error: Request failed with status code 404: No paystubs to update");

            const updatedPaystubs = paystubs.map(paystub => {
                if (paystub.id === edittedPaystub.id)
                    return edittedPaystub;
                else
                    return paystub;
            });
            
            writeFile(fileName, JSON.stringify(updatedPaystubs, null, 2));

            console.log(`PUT /api/paystubs/${year} status: 200`);
            res.status(200).json(edittedPaystub);
        } catch (err) {
            console.log("Error with put paystubs request: ", err);
        }
    } else if (method === "DELETE") {
        try {
            const paystubToDelete = req?.body;
            const paystubs = await getPaystubData();

            if (!paystubs)
                res.status(400).send("Error: Request failed with status code 404: No paystubs to delete from");

            const updatedPaystubs = paystubs.filter(paystub => {
                return paystub.id !== paystubToDelete.id;
            });
            
            writeFile(fileName, JSON.stringify(updatedPaystubs, null, 2));

            console.log(`DELETE /api/paystubs/${year} status: 200`);
            res.status(200).json(paystubToDelete);
        } catch (err) {
            console.log("Error with delete paystubs request: ", err);
        }
    } else {
        res.status(405).end(`Method ${method} not allowed`);
    }
}