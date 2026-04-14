import clientPromise from "./mongodb";

export async function logError(error, req, username) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const errorsCol = db.collection("errors");

  // Create the error object to give the details of all the errors
  const errorDetails = {
    timestamp: new Date(),
    method: req.method,
    endpoint: req.url,
    username,
    query: req.query,
    params: req.params,
    body: sanitize(req.body),
    name: error.name,
    message: error.message,
  };

  await errorsCol.insertOne(errorDetails);
}
