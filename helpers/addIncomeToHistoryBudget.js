// Add to a month's budget in the history array based on the paycheck's net income

const addIncomeToHistoryBudget = (paycheck, history) => {
    const paycheckDate = new Date(paycheck.date);
    const paycheckMonth = paycheckDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
    const paycheckYear = paycheckDate.getFullYear();

    // Find the month in the history array that matches the paycheck's month
    const foundMonth = history.find(currentMonth => {
        return currentMonth.month === paycheckMonth && currentMonth.year === paycheckYear;
    });

    // Add the paycheck's net income to the budget
    foundMonth.budget += paycheck.net;

    // Update the leftover amount
    foundMonth.leftover = parseFloat((foundMonth.budget - foundMonth.actual).toFixed(2));

    return foundMonth;
};

export default addIncomeToHistoryBudget;