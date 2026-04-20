import { FUN_MONEY } from "./constants/categories";
import { TRANSACTION_TYPES, TRANSFER_ACCOUNTS } from "./constants/transactions";
import clientPromise from "./mongodb";

export async function updateFunMoney({ username, month, year, session }) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const categoriesCol = db.collection("categories");
  const transactionsCol = db.collection("transactions");
  const incomeCol = db.collection("income");

  // Get all categories' budget total except for Fun Money for the given month and year
  const categoriesTotal = await categoriesCol
    .aggregate(
      [
        {
          $match: {
            username,
            month,
            year,
            name: { $ne: FUN_MONEY },
            parentCategoryId: { $exists: false },
          },
        },
        {
          $group: {
            _id: { username, month: "$month", year: "$year" },
            budget: { $sum: "$budget" },
          },
        },
        { $project: { budget: 1, _id: 0 } },
      ],
      { session, maxTimeMS: 5000 },
    )
    .toArray();

  const budgetTotals =
    categoriesTotal.length > 0 ? categoriesTotal[0].budget : 0;

  // Get the income total for the given month and year
  const incomeTotal = await transactionsCol
    .aggregate(
      [
        { $match: { username, month, year, type: TRANSACTION_TYPES.INCOME } },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
          },
        },
        { $project: { amount: 1, _id: 0 } },
      ],
      { session, maxTimeMS: 5000 },
    )
    .toArray();

  const monthIncome = incomeTotal.length > 0 ? incomeTotal[0].amount : 0;

  // Get the total transfers in and out of a users account
  const transfersTotals = await transactionsCol
    .aggregate(
      [
        { $match: { username, month, year, type: TRANSACTION_TYPES.TRANSFER } },
        {
          $group: {
            _id: "$toAccount",
            amount: { $sum: "$amount" },
          },
        },
        {
          $project: {
            account: "$_id",
            amount: 1,
            _id: 0,
          },
        },
      ],
      { session, maxTimeMS: 5000 },
    )
    .toArray();

  const transfers = transfersTotals.reduce(
    (sum, current) => {
      if (current.account === TRANSFER_ACCOUNTS.CHECKING) {
        sum.in += current.amount;
      }

      if (current.account === TRANSFER_ACCOUNTS.SAVINGS) {
        sum.out += current.amount;
      }

      return sum;
    },
    { in: 0, out: 0 },
  );

  // Get the totals
  const totalFunds = monthIncome + transfers.in;

  const totalOutflows = budgetTotals + transfers.out;

  const funMoneyBudget = totalFunds - totalOutflows;

  // Update the user's Fun Money category in MongoDB
  await categoriesCol.updateOne(
    {
      username,
      month,
      year,
      name: FUN_MONEY,
    },
    {
      $set: {
        budget: funMoneyBudget,
      },
    },
    { session, maxTimeMS: 5000 },
  );
}
