// Add to a month's budget in the history array based on the paycheck's net income

const addIncomeToHistoryBudget = (paycheck, history) => {
  const paycheckDate = new Date(paycheck.date);
  const paycheckMonth = paycheckDate.toLocaleDateString("default", {
    month: "long",
    timeZone: "UTC",
  });
  const paycheckYear = paycheckDate.getFullYear();

  // Find the month in the history array that matches the paycheck's month
  const foundMonth = history.find((currentMonth) => {
    return (
      currentMonth.month === paycheckMonth && currentMonth.year === paycheckYear
    );
  });

  // Add the paycheck's net income to the budget
  const updatedBudget = (foundMonth.budget += paycheck.net);

  // Update the leftover amount
  const updatedLeftover = parseFloat(
    (updatedBudget - foundMonth.actual).toFixed(2)
  );

  const updatedMonth = {
    ...foundMonth,
    budget: updatedBudget,
    leftover: updatedLeftover,
  };

  return updatedMonth;
};

export default addIncomeToHistoryBudget;
