// Subtract from a month's budget in the history array based on the paycheck's net income

const deleteIncomeFromHistoryBudget = (paycheck, history) => {
    const paycheckDate = new Date(paycheck.date);
    const paycheckMonth = paycheckDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
    const paycheckYear = paycheckDate.getFullYear();

    // Find the month in the history array that matches the paycheck's month
    const foundMonth = history.find(currentMonth => {
        return currentMonth.month === paycheckMonth && currentMonth.year === paycheckYear;
    });

    // Delete the paycheck's net income from the budget
    foundMonth.budget = parseFloat((foundMonth.budget - paycheck.net).toFixed(2));

    // Update the leftover amount
    foundMonth.leftover = parseFloat((foundMonth.budget - foundMonth.actual).toFixed(2));

    return foundMonth;
};

export default deleteIncomeFromHistoryBudget;