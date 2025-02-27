const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

export default async function handler(req, res) {
    const username = req?.query?.username;
    const year = req?.query?.year;
    const method = req?.method;
    const key = `${username}/paystubs/paystubs-${username}-${year}.json`;

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
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "POST") {
        try {
            const newPaystub = req?.body;
            const paystubs = await getPaystubData();
            const updatedPaystubs = [...paystubs, newPaystub];
            
            const postParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedPaystubs, null, 2),
                ContentType: "application/json"
            };

            await s3.putObject(postParams).promise();

            console.log(`POST /api/paystubs/${year} status: 200`);
            res.status(200).json(updatedPaystubs);
        } catch (err) {
            console.log("Error with POST paystubs request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "PUT") {
        try {
            const edittedPaystub = req?.body;
            const paystubs = await getPaystubData();

            const updatedPaystubs = paystubs.map(paystub => {
                if (paystub.id === edittedPaystub.id)
                    return edittedPaystub;
                else
                    return paystub;
            });

            const putParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedPaystubs, null, 2),
                ContentType: "application/json"
            };

            await s3.putObject(putParams).promise();

            console.log(`PUT /api/paystubs/${year} status: 200`);
            res.status(200).json(updatedPaystubs);
        } catch (err) {
            console.log("Error with PUT paystubs request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "DELETE") {
        try {
            const paystubToDelete = req?.body;
            const paystubs = await getPaystubData();

            const updatedPaystubs = paystubs.filter(paystub => {
                return paystub.id !== paystubToDelete.id;
            });

            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedPaystubs, null, 2),
                ContentType: "application/json"
            };

            await s3.putObject(deleteParams).promise();

            console.log(`DELETE /api/paystubs/${year} status: 200`);
            res.status(200).json(updatedPaystubs);
        } catch (err) {
            console.log("Error with DELETE paystubs request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else {
        res.status(400).send("Invalid request method");
    }
}