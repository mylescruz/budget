import clientPromise from "./mongodb";

export async function updateFunMoney({ username, month, year, session }) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const categoriesCol = db.collection("categories");
  const paychecksCol = db.collection("paychecks");
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
      { session }
    )
    .toArray();

  const budgetTotals =
    categoriesTotal.length > 0 ? categoriesTotal[0].budget : 0;

  // Get the paychecks total for the given month and year
  const paychecksTotal = await paychecksCol
    .aggregate(
      [
        { $match: { username, month, year } },
        {
          $group: {
            _id: null,
            net: { $sum: "$net" },
          },
        },
        { $project: { net: 1, _id: 0 } },
      ],
      { session }
    )
    .toArray();

  const monthIncome = paychecksTotal.length > 0 ? paychecksTotal[0].net : 0;

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
        budget: monthIncome - budgetTotals,
      },
    },
    { session }
  );
}
