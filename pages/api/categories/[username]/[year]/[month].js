// API Endpoint for a user's categories data

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";

// Configuring AWS SDK to connect to Amazon S3
const S3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET_NAME = process.env.BUCKET_NAME;

// Function to convert the stream object from S3 to JSON
const streamToJSON = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf-8");
        const data = JSON.parse(body);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
    stream.on("error", (err) => {
      reject(err);
    });
  });
};

// The file containing default categories for new users
const defaultCategoriesFile = "default_categories.json";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) return res.status(401).send("Must login to view your data!");

  const username = req?.query?.username;

  // If a user tries to directly access a different user's data, send an error message
  if (session.user.username !== username)
    return res.status(403).send("Access denied to this user's data");

  const month = req?.query?.month.toLowerCase();
  const year = req?.query?.year;
  const method = req?.method;

  // S3 key for the location of the user's categories file
  const key = `users/${username}/categories/${year}/categories-${username}-${month}${year}.json`;

  // Function that returns the user's categories from S3
  async function getCategoriesData() {
    // S3 File Parameters for the user's categories
    const categoriesParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      // Get the categories data from S3
      const categoriesData = await S3.send(
        new GetObjectCommand(categoriesParams)
      );
      return await streamToJSON(categoriesData.Body);
    } catch (error) {
      if (error.name === "NoSuchKey") {
        // Check if there is a category file for the previous month
        try {
          // Get the previous month based on the month and year given
          const givenMonth = new Date(`${month} 01, ${year}`);
          const monthNumber = givenMonth.getMonth();
          let previousMonthNumber = monthNumber - 1;
          let yearToCheck = year;
          if (monthNumber === 0) {
            previousMonthNumber = 11;
            yearToCheck -= 1;
          }

          const previousMonthDate = new Date(yearToCheck, previousMonthNumber);
          const previousMonth = previousMonthDate
            .toLocaleDateString("en-US", { month: "long" })
            .toLowerCase();

          // The S3 key for the location of the user's previous months' categories file
          const previousMonthKey = `users/${username}/categories/${yearToCheck}/categories-${username}-${previousMonth}${yearToCheck}.json`;

          // Previous months' categories file parameters for S3
          const previousMonthParams = {
            Bucket: BUCKET_NAME,
            Key: previousMonthKey,
          };

          // Get the category file from the previous month
          const categoriesData = await S3.send(
            new GetObjectCommand(previousMonthParams)
          );
          const previousCategories = await streamToJSON(categoriesData.Body);

          // Set the previous months categories to the new month categories
          // Update all the actual values to zero to signify a new month
          const newMonthCategories = previousCategories.map((category) => {
            if (category.fixed) {
              return category;
            } else {
              if (category.hasSubcategory) {
                const newSubcategories = category.subcategories.map(
                  (subcategory) => {
                    return { ...subcategory, actual: 0 };
                  }
                );

                return {
                  ...category,
                  actual: 0,
                  subcategories: newSubcategories,
                };
              } else {
                return { ...category, actual: 0 };
              }
            }
          });

          // S3 File Parameters for the user's new categories
          const categoriesParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: JSON.stringify(newMonthCategories, null, 2),
            ContentType: "application/json",
          };

          // Place new categories file in the user's folder in S3
          await S3.send(new PutObjectCommand(categoriesParams));

          return newMonthCategories;
        } catch (err) {
          if (err.name === "NoSuchKey") {
            // If no other files, use the default categories stored in the default file
            const defaultKey = `default/${defaultCategoriesFile}`;

            // S3 File Parameters for the default categories
            const defaultCategoriesParams = {
              Bucket: BUCKET_NAME,
              Key: defaultKey,
            };

            // Get the default category file
            const defaultCategoriesData = await S3.send(
              new GetObjectCommand(defaultCategoriesParams)
            );

            // Create new categories based on the default categories
            const newCategories = await streamToJSON(
              defaultCategoriesData.Body
            );

            // S3 File Parameters for the user's new default categories
            const categoriesParams = {
              Bucket: BUCKET_NAME,
              Key: key,
              Body: JSON.stringify(newCategories, null, 2),
              ContentType: "application/json",
            };

            // Place new categories file in the user's folder in S3
            await S3.send(new PutObjectCommand(categoriesParams));

            return newCategories;
          }
        }
      } else {
        console.error("Error retrieving the categories data from S3: ", error);
        return null;
      }
    }
  }

  if (method === "GET") {
    // Return the user's categories for the provided month from S3
    try {
      const categories = await getCategoriesData();

      // Send the categories array in the response
      res.status(200).json(categories);
    } catch (err) {
      console.error(`${method} categories request failed: ${err}`);
      res
        .status(500)
        .send(`Error occurred while getting ${username}'s categories`);
    }
  } else if (method === "POST") {
    // Add the new category to the user's categories in S3
    try {
      const newCategory = req?.body;
      const categories = await getCategoriesData();
      const updatedCategories = [...categories, newCategory];

      // S3 File Parameters for the user's updated categories
      const categoriesParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(updatedCategories, null, 2),
        ContentType: "application/json",
      };

      // Place updated categories file in the user's folder in S3
      await S3.send(new PutObjectCommand(categoriesParams));

      // Send the new category in the response
      res.status(200).json(newCategory);
    } catch (error) {
      console.error(`${method} categories request failed: ${error}`);
      res.status(500).send("Error occurred while adding a category");
    }
  } else if (method === "PUT") {
    // Update the user's categories in S3
    try {
      const edittedCategories = req?.body;

      // S3 File Parameters for the user's updated categories
      const categoriesParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(edittedCategories, null, 2),
        ContentType: "application/json",
      };

      // Place updated categories file in the user's folder in S3
      await S3.send(new PutObjectCommand(categoriesParams));

      // Send the updated categories array in the response
      res.status(200).json(edittedCategories);
    } catch (error) {
      console.error(`${method} categories request failed: ${error}`);
      res.status(500).send("Error occurred while updating categories");
    }
  } else if (method === "DELETE") {
    // Delete the given category from the user's categories in S3
    try {
      const categoryToDelete = req?.body;
      const categories = await getCategoriesData();

      // Remove category from the categories array
      const updatedCategories = categories.filter((category) => {
        return category.id !== categoryToDelete.id;
      });

      // S3 File Parameters for the user's updated categories
      const categoriesParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(updatedCategories, null, 2),
        ContentType: "application/json",
      };

      // Place updated categories file in the user's folder in S3
      await S3.send(new PutObjectCommand(categoriesParams));

      // Send the deleted category in the response
      res.status(200).json(categoryToDelete);
    } catch (error) {
      console.error(`${method} categories request failed: ${error}`);
      res.status(500).send("Error occurred while deleting a category");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
