// API Endpoint for all users data

// Configuring AWS SDK to connect to Amazon S3
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

    // S3 key for the location of the users file
    const key = 'users/users-index.json';

    // Function that returns all users in the users index
    async function getUsers() {
        // The users index file parameters for S3
        const usersParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        // Get the users data from S3
        const usersData = await s3.getObject(usersParams).promise();
        return JSON.parse(usersData.Body.toString('utf-8'));
    };

    if (method === 'GET') {
        // Return all the users from S3
        try {
            const users = await getUsers();
            
            // Send the users array in the response
            res.status(200).json(users);
        } catch (err) {
            console.error(`${method} users request failed: ${err}`);
            res.status(500).send("Error occurred while retrieving all users");
        }
    } else if (method === 'POST') {
        // Add a new user to the users index in S3
        try {
            const newUser = req?.body;
            const users = await getUsers();

            const updatedUsers = [...users, newUser];

            // Users array with the new user file parameters for S3
            const usersParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedUsers, null, 2),
                ContentType: "application/json"
            };

            // Place updated users file in S3
            await s3.putObject(usersParams).promise();

            // Send the updated users in the response
            res.status(200).json(updatedUsers);
        } catch (err) {
            console.error(`${method} users request failed: ${err}`);
            res.status(500).send("Error occurred while adding a new user");
        }
    } else {
        res.status(405).send(`Method ${method} not allowed`);
    }
};