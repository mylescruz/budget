// Subtract from a month's budget in the history array based on the paystub's net income

const deleteIncomeFromHistoryBudget = (paystub, history) => {
    const paystubDate = new Date(paystub.date);
    const paystubMonth = paystubDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
    const paystubYear = paystubDate.getFullYear();

    // Find the month in the history array that matches the paystubs month
    const foundMonth = history.find(currentMonth => {
        return currentMonth.month === paystubMonth && currentMonth.year === paystubYear;
    });

    // Delete the paystub's net income from the budget
    foundMonth.budget = parseFloat((foundMonth.budget - paystub.net).toFixed(2));

    // Update the leftover amount
    foundMonth.leftover = parseFloat((foundMonth.budget - foundMonth.actual).toFixed(2));

    return foundMonth;
};

export default deleteIncomeFromHistoryBudget;