const bcrypt = require('bcrypt');
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

    // Get the user information that matches the username provided
    async function getUser(username) {
        const key = `${username}/info-${username}.json`;
        const userParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        const user = await s3.getObject(userParams).promise();
        return JSON.parse(user.Body.toString('utf-8'));
    }

    // Use bcrypt to check the encrypted password
    async function checkHashedPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (err) {
            console.error("Error comparing passwords: ", err);
            return false;
        }
    }

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
                    username: user.username
                };
                res.status(200).json(verifiedUser);
            } else {
                console.log("Invalid user credentials");
                res.status(401).json(null);
            }
        } catch (err) {
            if (err.code === 'NoSuchKey') {
                // If no user found, return a null object
                console.log("Invalid user credentials");
                res.status(401).json(null);
            } else {
                res.status(500).send(`${method} request failed: ${err}`);
            }
        }
    } else {
        res.status(400).send("Invalid request method");
    }
};