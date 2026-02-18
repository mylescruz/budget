// API Endpoint for a user's income

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { updateFunMoney } from "@/lib/updateFunMoney";
import centsToDollars from "@/helpers/centsToDollars";

export default async function handler(req, res) {
  // Using NextAuth.js to authenticate a user's session in the server
  const session = await getServerSession(req, res, authOptions);

  // If there is no session, send an error message
  if (!session) {
    return res.status(401).send("Must login to view your data!");
  }

  // Configure MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const incomeContext = {
    client: client,
    incomeCol: db.collection("income"),
    username: session.user.username,
  };

  switch (req.method) {
    case "GET":
      return getIncome(req, res, incomeContext);
    case "POST":
      return addIncome(req, res, incomeContext);
    default:
      es.status(405).send(`${req.method} method not allowed`);
  }
}

// Get user's income array from MongoDB
async function getIncome(req, res, { incomeCol, username }) {
  const year = parseInt(req.query.year);

  try {
    const incomeDocs = await incomeCol.find({ username, year }).toArray();

    const income = incomeDocs.map((source) => {
      const formattedSource = {
        _id: source._id,
        date: source.date,
        type: source.type,
        name: source.name,
        description: source.description,
        amount: centsToDollars(source.amount),
      };

      if (source.type === "Paycheck") {
        formattedSource.gross = centsToDollars(source.gross);
        formattedSource.deductions = centsToDollars(source.deductions);
      }

      return formattedSource;
    });

    return res.status(200).json(income);
  } catch (error) {
    console.error(`GET income request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occurred while getting the income for ${username}`);
  }
}

// Add a user's new source of income to MongoDB
async function addIncome(req, res, { client, incomeCol, username }) {
  const mongoSession = client.startSession();

  try {
    const sourceInfo = { ...req.body };

    // Define the source's date identifiers
    const [sourceYear, sourceMonth, sourceDay] = sourceInfo.date
      .split("-")
      .map(Number);

    // Assign the source's identifiers
    const newSource = {
      type: sourceInfo.type,
      date: sourceInfo.date,
      name: sourceInfo.name.trim(),
      description: sourceInfo.description.trim(),
      amount: parseFloat(sourceInfo.amount) * 100,
      username,
      month: sourceMonth,
      year: sourceYear,
    };

    if (newSource.type === "Paycheck") {
      newSource.gross = parseFloat(sourceInfo.gross) * 100;
      newSource.deductions =
        parseFloat(sourceInfo.gross) * 100 -
        parseFloat(sourceInfo.amount) * 100;
    }

    if (newSource.type === "Unemployment") {
      newSource.name = "EDD";
    }

    const incomeSources = [];

    if (newSource.type === "Paycheck" && sourceInfo.repeating) {
      let dateIndex = newSource.date;

      while (dateIndex <= sourceInfo.endRepeatDate) {
        const [year, month, day] = dateIndex.split("-").map(Number);
        const date = new Date(year, month - 1, day);

        const paycheckSource = { ...newSource, date: dateIndex, month: month };

        incomeSources.push(paycheckSource);

        switch (sourceInfo.frequency) {
          case "Weekly":
            date.setDate(date.getDate() + 7);
            dateIndex = date.toLocaleDateString("en-CA");
            break;
          case "Bi-Weekly":
            date.setDate(date.getDate() + 14);
            dateIndex = date.toLocaleDateString("en-CA");
            break;
          case "Monthly":
            const nextDate = new Date(
              date.getFullYear(),
              date.getMonth() + 1,
              day,
            );
            dateIndex = nextDate.toLocaleDateString("en-CA");
            break;
          default:
            throw new Error("Invalid repeating paycheck frequency");
        }
      }
    } else {
      incomeSources.push(newSource);
    }

    let insertedResult;

    // Start a transaction to process all MongoDB statements or rollback any failures
    await mongoSession.withTransaction(async (session) => {
      // Add the new sources to the income collection in MongoDB
      insertedResult = await incomeCol.insertMany(incomeSources, {
        session,
      });

      // Update the Fun Money category for each month that a paycheck was added to
      let monthIndex = sourceMonth;

      const [endRepeatYear, endRepeatMonth, endRepeatDay] =
        sourceInfo.endRepeatDate.split("-").map(Number);

      while (monthIndex <= endRepeatMonth) {
        await updateFunMoney({
          username,
          month: monthIndex,
          year: sourceYear,
          session,
        });

        monthIndex += 1;
      }
    });

    // Format the inserted sources to send back to the client
    const insertedSources = incomeSources.map((source, index) => {
      const { username: u, month: m, year: y, ...sourceDetails } = source;

      const addedSource = {
        ...sourceDetails,
        _id: insertedResult.insertedIds[index],
        amount: centsToDollars(sourceDetails.amount),
      };

      if (addedSource.type === "Paycheck") {
        addedSource.gross = centsToDollars(addedSource.gross);
        addedSource.deductions = centsToDollars(addedSource.deductions);
      }

      return addedSource;
    });

    return res.status(200).json(insertedSources);
  } catch (error) {
    console.error(`POST income request failed for ${username}: ${error}`);
    return res
      .status(500)
      .send(`Error occured while adding a source of income for ${username}`);
  } finally {
    await mongoSession.endSession();
  }
}
