import clientPromise from "./mongodb";

export async function updateFunMoney({ username, month, year, session }) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const categoriesCol = db.collection("categories");
  const transactionsCol = db.collection("transactions");
  const incomeCol = db.collection("income");
  const funMoney = "Fun Money";

  // Get all categories' budget total except for Fun Money for the given month and year
  const categoriesTotal = await categoriesCol
    .aggregate(
      [
        {
          $match: {
            username,
            month,
            year,
            name: { $ne: funMoney },
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
      { session },
    )
    .toArray();

  const budgetTotals =
    categoriesTotal.length > 0 ? categoriesTotal[0].budget : 0;

  // Get the income total for the given month and year
  const incomeTotal = await incomeCol
    .aggregate(
      [
        { $match: { username, month, year } },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
          },
        },
        { $project: { amount: 1, _id: 0 } },
      ],
      { session },
    )
    .toArray();

  const monthIncome = incomeTotal.length > 0 ? incomeTotal[0].amount : 0;

  // Get the total transfers in and out of a users account
  const transfersTotals = await transactionsCol
    .aggregate(
      [
        { $match: { username, month, year, type: "Transfer" } },
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
      { session },
    )
    .toArray();

  const transfers = transfersTotals.reduce(
    (sum, current) => {
      if (current.account === "Checking") {
        sum.in += current.amount;
      }

      if (current.account === "Savings") {
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
      name: funMoney,
    },
    {
      $set: {
        budget: funMoneyBudget,
      },
    },
    { session },
  );
}
