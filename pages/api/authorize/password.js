// API Endpoint to authorize a user's credentials

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const bcrypt = require('bcrypt');

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

// Get the user information that matches the username provided
async function getUser(username) {
    const key = `users/${username}/info-${username}.json`;

    // S3 File Parameters for the user's info
    const userParams = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    const userData = await S3.send(new GetObjectCommand(userParams));
    return await streamToJSON(userData.Body);
};

// Use bcrypt to check the encrypted password
async function checkHashedPassword(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error("Error comparing passwords: ", error);
        return false;
    }
};

export default async function handler(req, res) {
    const method = req?.method;

    if (method === 'POST') {
        try {
            const credentials = req?.body;
            const user = await getUser(credentials.username);

            // Check if password given matches the stored password
            const passwordsMatch = await checkHashedPassword(credentials.password, user.password_hash);

            if (passwordsMatch) {
                const verifiedUser = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    onboarded: user.onboarded
                };

                // Send back verified user to NextAuth
                res.status(200).json(verifiedUser);
            } else {
                res.status(401).json(null);
            }
        } catch (error) {
            if (error.name === 'NoSuchKey') {
                // If no user found, return a null object
                res.status(401).json(null);
            } else {
                console.error(`${method} authorize request failed: ${error}`);
                res.status(500).send("An error occurred while authorizing this user's credentials. Please try again later!");
            }
        }
    } else {
        res.status(405).send(`${method} method not allowed`);
    }
};