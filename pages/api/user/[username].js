// API Endpoint for a user information

import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Initializing the encryption for the user's password using bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Configuring AWS SDK to connect to Amazon S3
const S3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const BUCKET_NAME = process.env.BUCKET_NAME;

const USER_ROLE = "User";

export default async function handler(req, res) {
    const method = req?.method;
    const username = req?.query?.username;

    // S3 key for the file's location
    const key = `users/${username}/info-${username}.json`;

    // Function to get a new userId based off the previous users
    async function getNewUserId() {
        const rsp = await fetch(`${process.env.NEXTAUTH_URL}/api/user/users`);
        const users = await rsp.json();

        // Find the max ID number
        let maxID = 0;
        if (users.length > 0)
            maxID = Math.max(...users.map(user => user.id));

        return parseInt(maxID) + 1;
    };

    // Function to add the new user to the user index in S3
    async function postUserToIndex(user) {
        await fetch(`${process.env.NEXTAUTH_URL}/api/user/users`, {
            method: "POST",
            headers: {
                Accept: "application.json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });
    };

    if (method === 'GET') {
        // Return the user based on the username from S3
        try {
            // S3 File Parameters for the user's info
            const userParams = {
                Bucket: BUCKET_NAME,
                Key: key
            };

            // Returns an object if the user already exists and throws an error if they do not
            await S3.send(new HeadObjectCommand(userParams));

            // Send an object stating the user exists
            res.status(200).json({ exists: true });
        } catch (error) {
            if (error.name === 'NotFound') {
                // If user doesn't exist, the user can sign up using that username
                res.status(200).json({ exists: false });
            } else {
                console.error(`${method} username request failed: ${error}`);
                res.status(500).send("Error occurred while finding user");
            }
        }
    } else if (method === 'POST') {
        // Add a new user in S3
        try {
            const user = req?.body;

            // Assign an ID to the user
            const newUserId = await getNewUserId();

            // Encrypt the user's entered password by using bcrypt
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);

            // Assign a timestamp for when the user created their profile
            const createdDate = new Date().toUTCString();

            // The data that a user's info file will contain
            const userInfo = {
                id: newUserId,
                name: user.name,
                email: user.email,
                username: user.username,
                password_hash: hashedPassword,
                role: USER_ROLE,
                created_ts: createdDate
            };

            // S3 File Parameters for the user's info
            const userInfoParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(userInfo, null, 2),
                ContentType: "application/json"
            };

            // Place the user's info file in the user's folder in S3
            await S3.send(new PutObjectCommand(userInfoParams));

            // The data that the user's index will contain about the user
            const newUser = {
                id: newUserId,
                username: user.username,
                email: user.email,
                created_ts: createdDate,
                role: USER_ROLE
            };

            // Add the user to the user's index in S3
            await postUserToIndex(newUser);

            // Send a success status message in the response
            res.status(200).send("User created successfully!");
        } catch (error) {
            console.error(`${method} username request failed: ${error}`);
            res.status(500).send("Error occurred while creating a new account");
        }
    } else {
        res.status(405).send(`Method ${method} not allowed`);
    }
};