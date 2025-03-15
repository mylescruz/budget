// API Endpoint to authorize a user's credentials

const bcrypt = require('bcrypt');

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

    // Function to get the user's info that matches the username provided
    async function getUser(username) {
        // S3 key for the file's location
        const key = `users/${username}/info-${username}.json`;

        // A user's file parameters for S3
        const userParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        // Get the user data from S3
        const user = await s3.getObject(userParams).promise();
        return JSON.parse(user.Body.toString('utf-8'));
    }

    // Function to compare the given password with the stored encrypted password
    async function checkHashedPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (err) {
            console.error("Error comparing passwords: ", err);
            return false;
        }
    }

    if (method === 'POST') {
        // Validate a user's credentials with the inputted credentials
        try {
            const credentials = req?.body;
            const user = await getUser(credentials.username);

            // Check if the passwords match
            const passwordsMatch = await checkHashedPassword(credentials.password, user.password_hash);

            if (passwordsMatch) {
                // If the passwords match, send back certain user data
                const verifiedUser = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username
                };
                
                // Sending back the verified user object in the response
                res.status(200).json(verifiedUser);
            } else {
                // If the passwords don't match, send back a null object signifying invalid credentials
                res.status(401).json(null);
            }
        } catch (err) {
            if (err.code === 'NoSuchKey') {
                // If there is no user found under that username, return a null object signifying invalid credentials
                res.status(401).json(null);
            } else {
                console.error(`${method} authorize request failed: ${err}`)
                res.status(500).send("Error occured while authorizing this account");
            }
        }
    } else {
        res.status(405).send(`Method ${method} not allowed`);
    }
};