import clientPromise from "./mongodb";

export async function logError(error) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const errorsCol = db.collection("errors");

  await errorsCol.insertOne(error);
}
