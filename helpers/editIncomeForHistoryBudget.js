// Edit a month's budget in the history array based on the paystub's previous net income and its new net income

const editIncomeForHistoryBudget = (newPaystub, oldPaystub, history) => {
    const paystubDate = new Date(newPaystub.date);
    const paystubMonth = paystubDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
    const paystubYear = paystubDate.getFullYear();

    // Find the month in the history array that matches the paystubs month
    const foundMonth = history.find(currentMonth => {
        return currentMonth.month === paystubMonth && currentMonth.year === paystubYear;
    });

    // Add the paystub's new net income and subtract the paystub's old net income from the budget
    foundMonth.budget = parseFloat((foundMonth.budget + newPaystub.net - oldPaystub.net).toFixed(2));
    
    // Update the leftover amount
    foundMonth.leftover = parseFloat((foundMonth.budget - foundMonth.actual).toFixed(2));

    return foundMonth;
};

export default editIncomeForHistoryBudget;