import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';

const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

const defaultCategoriesFile = 'default_categories.json';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).send("Must login to view your data!");
    }

    const username = req?.query?.username;

    if (session.user.username !== username) {
        return res.status(401).send("Access denied to this user's data");
    }

    const month = req?.query?.month.toLowerCase();
    const year = req?.query?.year;
    const method = req?.method;
    const key = `${username}/categories/${year}/categories-${username}-${month}${year}.json`;

    async function getCategoriesData() {
        const getParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            const categoriesData = await s3.getObject(getParams).promise();
            return JSON.parse(categoriesData.Body.toString('utf-8'));
        } catch(err) {
            if (err.code === 'NoSuchKey') {
                try {
                    // Check if there is a category file for the last month
                    const givenMonth = new Date(`${month} 01, ${year}`);
                    const monthNumber = givenMonth.getMonth();
                    let previousMonthNumber = monthNumber - 1;
                    let yearToCheck = year;
                    if (monthNumber === 0) {
                        previousMonthNumber = 11;
                        yearToCheck -= 1;
                    }

                    const previousMonthDate = new Date(yearToCheck, previousMonthNumber);
                    const previousMonth = previousMonthDate.toLocaleDateString('en-US', {month: 'long'}).toLowerCase();
                    
                    const previousMonthKey = `${username}/categories/${yearToCheck}/categories-${username}-${previousMonth}${yearToCheck}.json`;
                    
                    const previousMonthParams = {
                        Bucket: BUCKET_NAME,
                        Key: previousMonthKey
                    };

                    const categoriesData = await s3.getObject(previousMonthParams).promise();
                    const previousCategories = JSON.parse(categoriesData.Body.toString('utf-8'));

                    const newMonthCategories = previousCategories.map(category => {
                        if (category.fixed) {
                            return category
                        } else {
                            if (category.hasSubcategory) {
                                const newSubcategories = category.subcategories.map(subcategory => {
                                    return {...subcategory, actual: 0};
                                });
                                
                                return {...category, actual: 0, subcategories: newSubcategories};
                            } else {
                                return {...category, actual: 0}
                            }
                        }
                    });

                    const createFileParams = {
                        Bucket: BUCKET_NAME,
                        Key: key,
                        Body: JSON.stringify(newMonthCategories, null, 2),
                        ContentType: "application/json"
                    };
                    await s3.putObject(createFileParams).promise();

                    return newMonthCategories;
                } catch (error) {
                    if (error.code === 'NoSuchKey') {
                        // If no other files, use the default categories
                        const defaultKey = `default/${defaultCategoriesFile}`;

                        const getDefaultParams = {
                            Bucket: BUCKET_NAME,
                            Key: defaultKey
                        };

                        const defaultCategories = await s3.getObject(getDefaultParams).promise();
                        const newCategories = JSON.parse(defaultCategories.Body.toString('utf-8'));

                        const createFileParams = {
                            Bucket: BUCKET_NAME,
                            Key: key,
                            Body: JSON.stringify(newCategories, null, 2),
                            ContentType: "application/json"
                        };
                        await s3.putObject(createFileParams).promise();

                        return newCategories;
                    }
                }
            } else {
                console.error("Error retrieving the categories data from S3: ", err);
            }
        }
    }
    
    if (method === "GET") {
        try {
            const categories = await getCategoriesData();

            console.log(`GET /api/categories/${year}/${month} status: 200`);
            res.status(200).send(JSON.stringify(categories, null, 2));
        } catch (err) {
            console.log("Error with get categories request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "POST") {
        try {
            const newCategory = req?.body;
            const categories = await getCategoriesData();
            const updatedCategories = [...categories, newCategory];

            const postParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedCategories, null, 2),
                ContentType: "application/json"
            };

            await s3.putObject(postParams).promise();
            
            console.log(`POST /api/categories/${year}/${month} status: 200`);
            res.status(200).json(updatedCategories);
        } catch (err) {
            console.log("Error with POST categories request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "PUT") {
        try {
            const edittedCategories = req?.body;

            const putParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(edittedCategories, null, 2),
                ContentType: "application/json"
            };

            await s3.putObject(putParams).promise();

            console.log(`PUT /api/categories/${year}/${month} status: 200`);
            res.status(200).json(edittedCategories);
        } catch (err) {
            console.log("Error with PUT categories request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else if (method === "DELETE") {
        try {
            const categoryToDelete = req?.body;
            const categories = await getCategoriesData();

            const updatedCategories = categories.filter(category => {
                return category.id !== categoryToDelete.id;
            });

            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: JSON.stringify(updatedCategories, null, 2),
                ContentType: "application/json"
            };
            
            await s3.putObject(deleteParams).promise();
            
            console.log(`DELETE /api/categories/${year}/${month} status: 200`);
            res.status(200).json(updatedCategories);
        } catch (err) {
            console.log("Error with DELETE category request: ", err);
            res.status(500).send(`${method} request failed: ${err}`);
        }
    } else {
        res.status(405).end(`Method ${method} not allowed`);
    }
}