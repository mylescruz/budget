const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

export default async function handler(req, res) {
    const method = req?.method;
    const userFolder = 'mylescruz';
    const key = `${userFolder}/history.json`;

    async function getHistoryData() {
        const getParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            const history = await s3.getObject(getParams).promise();
            return JSON.parse(history.Body.toString('utf-8'));
        } catch (err) {
            if (err.code === 'NoSuchKey') {
                console.log(`Creating a new history file for ${userFolder}`);

                const newHistory = [];

                const createFileParams = {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: JSON.stringify(newHistory, null, 2),
                    ContentType: "application/json"
                };

                await s3.putObject(createFileParams).promise();
                
                return newHistory;
            } else {
                console.error("Error retrieving the user's history from S3: ", err);
            }
        }
    }

    if (method === "GET") {
        try {
            const history = await getHistoryData();

            console.log(`GET /api/history status: 200`);
            res.status(200).send(JSON.stringify(history, null, 2));
        } catch (err) {
            console.log("Error with GET history request: ", err);
            res.status(400).send("Error: GET request failed with status code 404");
        }
    } else if (method === "POST") {
        try {
            const newHistory = req?.body;
            const history = await getHistoryData();
            const updatedHistory = [...history, newHistory];

            const postParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedHistory, null, 2),
                ContentType: "application/json"
            };

            await s3.putObject(postParams).promise();
            
            console.log(`POST /api/history status: 200`);
            res.status(200).json(updatedHistory);
        } catch (err) {
            console.log("Error with POST history request: ", err);
            res.status(404).send("Error: POST request failed with status code 404");
        }
    } else if (method === "PUT") {
        try {
            const edittedHistory = req?.body;
            const history = await getHistoryData();

            const updatedHistory = history.map(currentHistory => {
                if (currentHistory.id === edittedHistory.id)
                    return edittedHistory;
                else
                    return currentHistory;
            });

            const putParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedHistory, null, 2),
                ContentType: "application/json"
            };

            await s3.putObject(putParams).promise();

            console.log(`PUT /api/history status: 200`);
            res.status(200).json(updatedHistory);
        } catch (err) {
            console.log("Error with PUT history request: ", err);
            res.status(404).send("Error: PUT request failed with status code 404");
        }
    } else if (method === "DELETE") {
        try {
            const historyToDelete = req?.body;
            const history = await getHistoryData();

            const updatedHistory = history.filter(currentHistory => {
                return currentHistory.id !== historyToDelete.id;
            });

            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedHistory, null, 2),
                ContentType: "application/json"
            };
            
            await s3.putObject(deleteParams).promise();
            
            console.log(`DELETE /api/history status: 200`);
            res.status(200).json(updatedHistory);
        } catch (err) {
            console.log("Error with DELETE history request: ", err);
            res.status(404).send("Error: DELETE request failed with status code 404");
        }
    } else {
        res.status(405).end(`Method ${method} not allowed`);
    }
}