// API Endpoint to check if a username exists

import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Configuring AWS SDK to connect to Amazon S3
const S3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const BUCKET_NAME = process.env.BUCKET_NAME;

export default async function handler(req, res) {
    const method = req?.method;
    const username = req?.query?.username;
    const key = `users/${username}/info-${username}.json`;

    if (method === 'GET') {
        try {
            // S3 File Parameters for the user's info
            const userParams = {
                Bucket: BUCKET_NAME,
                Key: key
            };

            // Verify if the user exists by checking the info-username.json file
            await S3.send(new HeadObjectCommand(userParams));

            // Send a response showing the user exists
            res.status(200).json({ exists: true });
        } catch (error) {
            if (error.name === 'NotFound') {
                // If user doesn't exist, the user can successfully use that username
                res.status(200).json({ exists: false });
            } else {
                console.error(`${method} authorize/username request failed: ${error}`);
                res.status(500).send("An error occurred while checking if this user exists. Please try again later!");
            }
        }
    } else {
        res.status(405).send(`${method} method not allowed`);
    }
};