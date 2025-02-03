const updateMonthDetails = (updatedCategories, history, getMonthIncome, monthInfo) => {
    let totalActual = 0;
    updatedCategories.forEach(category => {
        totalActual += category.actual;
    });

    const income = getMonthIncome(monthInfo.monthName);

    const currentMonth = history.find(currentMonth => {
        return (currentMonth.month === monthInfo.monthName && currentMonth.year === monthInfo.year);
    });

    currentMonth.budget = income;
    currentMonth.actual = totalActual;
    currentMonth.leftover = income - totalActual;

    console.log(currentMonth);

    return currentMonth;
};

export default updateMonthDetails;