// lib/mongodb.js

import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const options = {};

if (!process.env.MONGO_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

let client = new MongoClient(uri, options);
let clientPromise;

if (process.env.NODE_ENV !== "production") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }

  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;
