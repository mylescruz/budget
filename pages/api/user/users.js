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
    const key = 'users/users-index.json';

    // Returns all users in the users index
    async function getUsers() {
        const usersParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        const usersData = await s3.getObject(usersParams).promise();
        return JSON.parse(usersData.Body.toString('utf-8'));
    };

    if (method === 'GET') {
        try {
            const users = await getUsers();
            
            res.status(200).json(users);
        } catch (err) {
            console.log('Error getting all users: ', err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === 'POST') {
        try {
            const newUser = req?.body;
            const users = await getUsers();

            const updatedUsers = [...users, newUser];

            // Place new user into the users index
            const usersParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedUsers, null, 2),
                ContentType: "application/json"
            };
            await s3.putObject(usersParams).promise();

            res.status(200).json(updatedUsers);
        } catch (err) {
            console.log('Error posting a new user: ', err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else {
        res.status(400).send("Invalid request method");
    }
};