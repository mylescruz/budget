import clientPromise from "./mongodb";

export async function updateGuiltFreeSpending({
  username,
  month,
  year,
  mongoSession,
}) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const categoriesCol = db.collection("categories");
  const paychecksCol = db.collection("paychecks");
  const GFS = "Guilt Free Spending";

  // Get all categories' budget total except for Guilt Free Spending for the given month and year
  const categoriesTotal = await categoriesCol
    .aggregate(
      [
        {
          $match: {
            username,
            month,
            year,
            name: { $ne: GFS },
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
      { session: mongoSession }
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
      { session: mongoSession }
    )
    .toArray();

  const monthIncome = paychecksTotal.length > 0 ? paychecksTotal[0].net : 0;

  // Update the user's Guilt Free Spending category in MongoDB
  await categoriesCol.updateOne(
    {
      username,
      month,
      year,
      name: GFS,
    },
    {
      $set: {
        budget: monthIncome - budgetTotals,
      },
    },
    { session: mongoSession }
  );
}
