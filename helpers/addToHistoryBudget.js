const addToHistoryBudget = (paystub, history) => {
    const paystubDate = new Date(paystub.date);
    const paystubMonth = paystubDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
    const paystubYear = paystubDate.getFullYear();

    const foundMonth = history.find(currentMonth => {
        return currentMonth.month === paystubMonth && currentMonth.year === paystubYear;
    });

    foundMonth.budget += paystub.net;
    foundMonth.leftover = foundMonth.budget - foundMonth.actual;

    return foundMonth;
};

export default addToHistoryBudget;