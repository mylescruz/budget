// API Endpoint for all users data

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Configuring AWS SDK to connect to Amazon S3
const S3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const BUCKET_NAME = process.env.BUCKET_NAME;

// Function to convert the stream object from S3 to JSON
const streamToJSON = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => {
            try {
                const body = Buffer.concat(chunks).toString('utf-8');
                const data = JSON.parse(body);
                resolve(data);
            } catch(error) {
                reject(error);
            }
        });
        stream.on("error", (err) => {
            reject(err);
        });
    });
};

export default async function handler(req, res) {
    const method = req?.method;

    // S3 key for the location of the users file
    const key = 'users/users-index.json';

    // Function that returns all users in the users index
    async function getUsers() {
        // S3 File Parameters for the users index
        const usersParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        // Get the users data from S3
        const usersData = await S3.send(new GetObjectCommand(usersParams));
        return await streamToJSON(usersData.Body);
    };

    if (method === 'GET') {
        // Return all the users from S3
        try {
            const users = await getUsers();
            
            // Send the users array in the response
            res.status(200).json(users);
        } catch (error) {
            console.error(`${method} users request failed: ${error}`);
            res.status(500).send("Error occurred while retrieving all users");
        }
    } else if (method === 'POST') {
        // Add a new user to the users index in S3
        try {
            const newUser = req?.body;
            const users = await getUsers();

            // Add new user to the users array
            const updatedUsers = [...users, newUser];

            // S3 File Parameters for the updated users index
            const usersParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedUsers, null, 2),
                ContentType: "application/json"
            };

            // Place updated users file in S3
            await S3.send(new PutObjectCommand(usersParams));

            // Send the updated users in the response
            res.status(200).json(updatedUsers);
        } catch (error) {
            console.error(`${method} users request failed: ${error}`);
            res.status(500).send("Error occurred while adding a new user");
        }
    } else {
        res.status(405).send(`Method ${method} not allowed`);
    }
};