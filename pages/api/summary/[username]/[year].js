import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

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

export default async function handler(req, res) {
  const method = req?.method;

  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  const username = req?.query?.username.toLowerCase();

  // If a user tries to directly access a different user's data, send an error message
  if (session.user.username !== username) {
    return res.status(401).send("Access denied to this user's data");
  }

  const year = req?.query?.year;

  async function getCategoryFiles() {
    // S3 prefix for the year's categories files
    const prefix = `users/${username}/categories/${year}/`;

    // S3 folder parameters for the user's category data
    const summaryParams = {
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    };

    try {
      // Get all the the objects inside the S3 folder containing the categories for the year given
      const categoriesResponse = await S3.send(
        new ListObjectsV2Command(summaryParams)
      );

      // Return each file's key path
      const categoryFiles = categoriesResponse.Contents?.map((file) => {
        return file.Key;
      });

      return categoryFiles;
    } catch (error) {
      console.error("Error retrieving the summary files from S3: ", error);
      return null;
    }
  }

  // Function that returns the user's categories from S3
  async function getCategoryData(key) {
    // S3 file parameters for the user's categories
    const categoriesParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      // Get the categories data
      const categoriesData = await S3.send(
        new GetObjectCommand(categoriesParams)
      );
      return await streamToJSON(categoriesData.Body);
    } catch (error) {
      console.error("Error retrieving summary from S3: ", error);
      return null;
    }
  }

  if (method === "GET") {
    try {
      const summary = [];

      // Get all the category files for the given year in S3
      const categoryFiles = await getCategoryFiles();

      // Loop through each file to get the totals for each category
      for (const key of categoryFiles) {
        // Get the categories for the given file
        const categories = await getCategoryData(key);

        // Create a set of category names
        const summaryNames = new Set(
          summary.map((category) => category.name.trim())
        );

        categories.forEach((category) => {
          // If the category is already in the summary set
          if (summaryNames.has(category.name.trim())) {
            // Get the index of the category in the summary array
            const foundCategoryIndex = summary.findIndex(
              (cat) => cat.name === category.name
            );

            // Find the category based on the index
            const foundCategory = summary[foundCategoryIndex];

            // Check if the category has subcategories
            if (category.hasSubcategory) {
              summary[foundCategoryIndex].hasSubcategory = true;

              // Create a set of subcategory names
              const subcategoryNames = new Set(
                foundCategory.subcategories.map(
                  (subcategory) => subcategory.name
                )
              );

              category.subcategories.forEach((subcategory) => {
                // Check a category's subcategory is already in the summary array
                if (subcategoryNames.has(subcategory.name.trim())) {
                  const foundSubcategoryIndex =
                    foundCategory.subcategories.findIndex(
                      (sub) => sub.name === subcategory.name
                    );

                  // Get the current actual value for the subcategory
                  const subcategoryActual =
                    foundCategory.subcategories[foundSubcategoryIndex].actual;

                  // Add the subcategory's actual to the actual value in the summary array
                  summary[foundCategoryIndex].subcategories[
                    foundSubcategoryIndex
                  ].actual = subcategory.actual + subcategoryActual;
                } else {
                  // If the subcategory is not in the summary array, add it
                  summary[foundCategoryIndex].subcategories.push(subcategory);
                }
              });
            }

            // Add the totals for the budget and the actual values to the summary array for that category
            summary[foundCategoryIndex].budget =
              foundCategory.budget + category.budget;
            summary[foundCategoryIndex].actual =
              foundCategory.actual + category.actual;
          } else {
            // If the summary array doesn't contain the category, add it to the array
            summary.push(category);
          }
        });
      }

      // Return the summary object in the response
      res.status(200).json(summary);
    } catch (error) {
      console.error(`${method} summary request failed: ${err}`);
      res
        .status(500)
        .send("Error occurred while retrieving the user's summary");
    }
  } else {
    res.status(405).send(`Method ${method} not allowed`);
  }
}
