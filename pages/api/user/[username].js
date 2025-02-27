const bcyrpt = require('bcrypt');
const saltRounds = 10;

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
    const username = req?.query?.username;

    const key = `${username}/info-${username}.json`;

    // Get new userId based off the previous users
    async function getNewUserId() {
        const rsp = await fetch(`${process.env.NEXTAUTH_URL}/api/user/users`);
        const users = await rsp.json();

        // Find the max ID number
        let maxID = 0;
        if (users.length > 0)
            maxID = Math.max(...users.map(user => user.id));

        return parseInt(maxID) + 1;
    };

    // Post the new user to the user index
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
        try {
            const userParams = {
                Bucket: BUCKET_NAME,
                Key: key
            };

            // Verify if the user exists by checking the info-username.json file
            await s3.headObject(userParams).promise();
            res.status(200).json({ exists: true });
        } catch (err) {
            if (err.code === 'NotFound') {
                // If user doesn't exist, the user can successfully use that username
                res.status(200).json({ exists: false });
            } else {
                res.status(500).send(`${method} request failed: ${err}`);
            }
        }
    } else if (method === 'POST') {
        // Creating a new user
        try {
            const user = req?.body;

            // Assign an ID to the user
            const newUserId = await getNewUserId();

            // Encrypt the user's entered password by using bcrypt
            const hashedPassword = await bcyrpt.hash(user.password, saltRounds);

            // Assign a timestamp for when the user created their profile
            const createdDate = new Date().toUTCString();

            // Add a user's file to their personal folder
            const userInfo = {
                id: newUserId,
                name: user.name,
                email: user.email,
                username: user.username,
                password_hash: hashedPassword,
                created_ts: createdDate
            };

            const userInfoParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(userInfo, null, 2),
                ContentType: "application/json"
            };

            await s3.putObject(userInfoParams).promise();

            // Add this new user to the users index
            const newUser = {
                id: newUserId,
                username: user.username,
                email: user.email,
                created_ts: createdDate
            };
            await postUserToIndex(newUser);

            res.status(200).send("User created successfully!");
        } catch (err) {
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else {
        res.status(400).send("Invalid request method");
    }
};