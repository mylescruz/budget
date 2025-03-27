// API Endpoint for an administrator to view the users

import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Configuring bcrypt for password encryption
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

// Function to convert the stream object from S3 to JSON
const streamToJSON = async (stream) => {
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
        stream.on('error', (error) => {
            reject(error);
        });
    });
};

export default async function handler(req, res) {
    // Authorize API call with NextAuth
    const session = await getServerSession(req, res, authOptions);

    const method = req?.method;

    // Reject a user if they try to access this endpoint without having a session
    if (!session)
        return res.status(401).send("You must login to view this information");

    // Reject a user if they are not an Administrator
    if (session.user.role !== "Administrator")
        return res.status(403).send("You do not have access to this information");

    const key = 'users/users-index.json';

    // Gets all the users from S3
    async function getUsers() {
        const usersParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        const usersData = await S3.send(new GetObjectCommand(usersParams));
        return await streamToJSON(usersData.Body);
    };

    // Gets the user from S3
    async function getUser(username) {
        const infoKey = `users/${username}/info-${username}.json`;

        const usersParams = {
            Bucket: BUCKET_NAME,
            Key: infoKey
        };

        const userData = await S3.send(new GetObjectCommand(usersParams));
        return await streamToJSON(userData.Body);
    };

    if (method === 'GET') {
        try {
            const users = await getUsers();
            
            // Return the users array
            res.status(200).json(users);
        } catch (error) {
            console.error(`${method} users request failed: ${error}`);
            res.status(500).send("An error occurred while retrieving the users. Please try again later!");
        }
    } else if (method === 'POST') {
        try {
            const user = req?.body;
            const users = await getUsers();
            
            // Create a user ID based on the time of creation
            const newID = Date.now();

            // Encrypt the user's entered password by using bcrypt
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);

            // Assign a timestamp for when the user created their profile
            const createdDate = new Date().toUTCString();

            // Add a user's file to their personal folder
            const userInfo = {
                id: newID,
                name: user.name,
                email: user.email,
                username: user.username,
                password_hash: hashedPassword,
                role: user.role,
                created_date: createdDate
            };

            const userKey = `users/${userInfo.username}/info-${userInfo.username}.json`;

            // S3 File Parameters for the user's info
            const userInfoParams = {
                Bucket: BUCKET_NAME,
                Key: userKey,
                Body: JSON.stringify(userInfo, null, 2),
                ContentType: "application/json"
            };

            // Place the user's info file in the user's folder in S3
            await S3.send(new PutObjectCommand(userInfoParams));

            // Add this new user to the users index
            const { password_hash, ...newUser } = userInfo;

            // Add new user to users array
            const updatedUsers = [...users, newUser];

            // S3 File Parameters for the users index
            const usersParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedUsers, null, 2),
                ContentType: "application/json"
            };

            // Place updated users in to S3
            await S3.send(new PutObjectCommand(usersParams));

            // Return the updated users array
            res.status(200).json(updatedUsers);
        } catch (error) {
            console.error(`${method} users request failed: ${error}`);
            res.status(500).send("An error occurred while adding the user. Please try again later!");
        }
    } else if (method === 'PUT') {
        try {
            const edittedUser = req?.body;
            const users = await getUsers();
            
            // Edit user in the users array
            const updatedUsers = users.map(user => {
                if (user.id === edittedUser.id) {
                    return edittedUser;
                }

                return user;
            });

            // S3 File Parameters for the users index
            const usersParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedUsers, null, 2),
                ContentType: "application/json"
            };

            // Place updated users in to S3
            await S3.send(new PutObjectCommand(usersParams));
            
            const user = await getUser(edittedUser.username);

            // Place the new user info file into S3
            const updatedUser = {...user, email: edittedUser.email, role: edittedUser.role};

            const userKey = `users/${updatedUser.username}/info-${updatedUser.username}.json`;

            // S3 File Parameters for the user info
            const userInfoParams = {
                Bucket: BUCKET_NAME,
                Key: userKey,
                Body: JSON.stringify(updatedUser, null, 2),
                ContentType: "application/json"
            };

            // Place updated users in to S3
            await S3.send(new PutObjectCommand(userInfoParams));

            // Return the updated users array
            res.status(200).json(updatedUsers);
        } catch (error) {
            console.error(`${method} users request failed: ${error}`);
            res.status(500).send("An error occurred while editting the user. Please try again later!");
        }
    } else if (method === 'DELETE') {
        try {
            const deletedUser = req?.body;
            const users = await getUsers();

            // Delete user from the users array
            const updatedUsers = users.filter(user => {
                return user.id !== deletedUser.id;
            });

            // S3 File Parameters for the users index
            const usersParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedUsers, null, 2),
                ContentType: "application/json"
            };

            // Place updated users in to S3
            await S3.send(new PutObjectCommand(usersParams));

            // Get all objects within the user's folder
            const userFolder = `users/${deletedUser.username}`;

            // S3 File Parameters for the users info
            const userFolderParams = {
                Bucket: BUCKET_NAME,
                Prefix: userFolder
            };

            // Get all the objects within the folder
            const listedObjects = await S3.send(new ListObjectsV2Command(userFolderParams));

            if (listedObjects.Contents.length > 0) {
                // S3 File Parameters for the users info
                const userInfoParams = {
                    Bucket: BUCKET_NAME,
                    Delete: {
                        Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
                        Quiet: false
                    }
                };

                await S3.send(new DeleteObjectsCommand(userInfoParams));
            }

            // Return the updated users array
            res.status(200).json(updatedUsers);
        } catch (error) {
            console.error(`${method} users request failed: ${error}`);
            res.status(500).send("An error occurred while deleting the user. Please try again later!");
        }
    } else {
        res.status(405).send(`${method} method not allowed`);
    }
};