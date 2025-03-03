// Edit a month's budget in the history array based on the paycheck's previous net income and its new net income

const editIncomeForHistoryBudget = (newPaycheck, oldPaycheck, history) => {
    const paycheckDate = new Date(newPaycheck.date);
    const paycheckMonth = paycheckDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
    const paycheckYear = paycheckDate.getFullYear();

    // Find the month in the history array that matches the paycheck's month
    const foundMonth = history.find(currentMonth => {
        return currentMonth.month === paycheckMonth && currentMonth.year === paycheckYear;
    });

    // Add the paycheck's new net income and subtract the paycheck's old net income from the budget
    foundMonth.budget = parseFloat((foundMonth.budget + newPaycheck.net - oldPaycheck.net).toFixed(2));
    
    // Update the leftover amount
    foundMonth.leftover = parseFloat((foundMonth.budget - foundMonth.actual).toFixed(2));

    return foundMonth;
};

export default editIncomeForHistoryBudget;