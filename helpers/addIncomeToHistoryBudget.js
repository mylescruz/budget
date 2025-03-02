const addIncomeToHistoryBudget = (paystub, history) => {
    const paystubDate = new Date(paystub.date);
    const paystubMonth = paystubDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
    const paystubYear = paystubDate.getFullYear();

    const foundMonth = history.find(currentMonth => {
        return currentMonth.month === paystubMonth && currentMonth.year === paystubYear;
    });

    foundMonth.budget += paystub.net;
    foundMonth.leftover = parseFloat((foundMonth.budget - foundMonth.actual).toFixed(2));

    return foundMonth;
};

export default addIncomeToHistoryBudget;