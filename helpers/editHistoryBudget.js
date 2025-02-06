const editHistoryBudget = (newPaystub, oldPaystub, history) => {
    const paystubDate = new Date(newPaystub.date);
    const paystubMonth = paystubDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
    const paystubYear = paystubDate.getFullYear();

    const foundMonth = history.find(currentMonth => {
        return currentMonth.month === paystubMonth && currentMonth.year === paystubYear;
    });

    foundMonth.budget = foundMonth.budget + newPaystub.net - oldPaystub.net;
    foundMonth.leftover = foundMonth.budget - foundMonth.actual;

    return foundMonth;
};

export default editHistoryBudget;