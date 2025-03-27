// API Endpoint for a user's information

import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

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

const USER_ROLE = "User";

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

// Function to get the user's info that matches the username provided
async function getUser(userKey) {
    // S3 File Parameters for the users info
    const userParams = {
        Bucket: BUCKET_NAME,
        Key: userKey
    };

    // Get the user data from S3
    const userData = await S3.send(new GetObjectCommand(userParams));
    return await streamToJSON(userData.Body);
};

// Gets all the users from S3
async function getUsers(indexKey) {
    const usersParams = {
        Bucket: BUCKET_NAME,
        Key: indexKey
    };

    const usersData = await S3.send(new GetObjectCommand(usersParams));
    return await streamToJSON(usersData.Body);
};

// Function to compare the given password with the stored encrypted password
async function checkHashedPassword(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (err) {
        console.error("Error comparing passwords: ", err);
        return false;
    }
};

export default async function handler(req, res) {
    // Authorize API call with NextAuth
    const session = await getServerSession(req, res, authOptions);

    const method = req?.method;
    const username = req?.query?.username;

    if (method !== "POST") {
        // Reject a user if they try to access this endpoint without having a session
        if (!session)
            return res.status(401).send("You must login to view this information");

        // Reject a user if they try to access another user's information 
        if (session.user.username !== username)
            return res.status(403).send("You do not have access to this information");
    }

    const userKey = `users/${username}/info-${username}.json`;
    const indexKey = 'users/users-index.json';

    if (method === 'GET') {
        try {
            const user = await getUser(userKey);
    
            // Return a user without its password
            const { password_hash, ...userInfo } = user;

            // Send the user in the response
            res.status(200).json(userInfo);
        } catch (error) {
            console.error(`${method} user/username request failed: ${error}`);
            res.status(500).send("An error occurred while getting your account info. Please try again later!");
        }
    } else if (method === 'POST') {
        // Creating a new user
        try {
            const user = req?.body;

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
                role: USER_ROLE,
                created_date: createdDate
            };

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
            const newUser = {
                id: newID,
                name: user.name,
                username: user.username,
                email: user.email,
                role: USER_ROLE,
                created_date: createdDate
            };

            const users = await getUsers(indexKey);
                        
            // Add new user to users array
            const updatedUsers = [...users, newUser];

            // S3 File Parameters for the users index
            const usersParams = {
                Bucket: BUCKET_NAME,
                Key: indexKey,
                Body: JSON.stringify(updatedUsers, null, 2),
                ContentType: "application/json"
            };

            // Place updated users in to S3
            await S3.send(new PutObjectCommand(usersParams));

            res.status(200).json(newUser);
        } catch (error) {
            console.error(`${method} user/username request failed: ${error}`);
            res.status(500).send("An error occurred while creating your account. Please try again later!");
        }
    } else if (method === 'PUT') {
        // Update a user's credentials
        try {
            const edittedUser = req?.body;
            const user = await getUser(userKey);

            // Check if the passwords match
            const passwordsMatch = await checkHashedPassword(edittedUser.currentPassword, user.password_hash);

            if (passwordsMatch) {
                let updatedPassword = user.password_hash;
                let updatedEmail = user.email;

                if ('newPassword' in edittedUser) {
                    updatedPassword = await bcrypt.hash(edittedUser.newPassword, saltRounds);
                }

                if ('newEmail' in edittedUser) {
                    updatedEmail = edittedUser.newEmail;
                }
                
                const userInfo = {
                    id: user.id,
                    name: user.name,
                    email: updatedEmail,
                    username: user.username,
                    password_hash: updatedPassword,
                    role: user.role,
                    created_date: user.created_date
                };

                let userInfoKey = userKey;

                // User's info file parameters for S3
                const userInfoParams = {
                    Bucket: BUCKET_NAME,
                    Key: userInfoKey,
                    Body: JSON.stringify(userInfo, null, 2),
                    ContentType: "application/json"
                };

                // Place the user's info file in the user's folder in S3
                await S3.send(new PutObjectCommand(userInfoParams));

                // Update user in the users index
                const { password_hash, ...updatedUser } = userInfo;

                const users = await getUsers(indexKey);
                            
                // Edit user in the users array
                const updatedUsers = users.map(user => {
                    if (user.id === updatedUser.id) {
                        return updatedUser;
                    }

                    return user;
                });

                // S3 File Parameters for the users index
                const usersParams = {
                    Bucket: BUCKET_NAME,
                    Key: indexKey,
                    Body: JSON.stringify(updatedUsers, null, 2),
                    ContentType: "application/json"
                };

                // Place updated users in to S3
                await S3.send(new PutObjectCommand(usersParams));

                // Sending back the verified user object in the response
                res.status(200).json(updatedUser);
            } else {
                // If the passwords don't match, send back a null object signifying invalid credentials
                res.status(401).send("Passwords do not match. Cannot update the password.");
            }
        } catch (err) {
            console.error(`${method} user/username request failed: ${err}`);
            res.status(500).send("An error occurred while updating your account. Please try again later!");
        }
    } else if (method === 'DELETE') {
        // Delete a user
        try {
            const deletedUser = req?.body;
            const user = await getUser(userKey);

            // Check if the passwords match
            const passwordsMatch = await checkHashedPassword(deletedUser.password, user.password_hash);

            if (passwordsMatch) {
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

                // Delete user from the users index
                const users = await getUsers(indexKey);

                // Delete user from the users array
                const updatedUsers = users.filter(user => {
                    return user.id !== deletedUser.id;
                });
                
                // S3 File Parameters for the users index
                const usersParams = {
                    Bucket: BUCKET_NAME,
                    Key: indexKey,
                    Body: JSON.stringify(updatedUsers, null, 2),
                    ContentType: "application/json"
                };
    
                // Place updated users in to S3
                await S3.send(new PutObjectCommand(usersParams));

                // Send back a successful status that the user was deleted
                res.status(200).send();
            } else {
                // If the passwords don't match, send back an error message
                res.status(401).send("Passwords do not match. Cannot delete your account.");
            }
        } catch (err) {
            console.error(`${method} user/username request failed: ${err}`);
            res.status(500).send("An error occurred while deleting your account. Please try again later!");
        }
    } else {
        res.status(405).send(`${method} method not allowed`);
    }
};