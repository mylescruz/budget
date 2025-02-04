const updateHistoryActual = (updatedCategories, history, monthInfo) => {
    let totalActual = 0;
    updatedCategories.forEach(category => {
        totalActual += category.actual;
    });

    const currentMonth = history.find(currentMonth => {
        return (currentMonth.month === monthInfo.monthName && currentMonth.year === monthInfo.year);
    });

    currentMonth.actual = totalActual;
    currentMonth.leftover = currentMonth.budget - totalActual;

    console.log(currentMonth);

    return currentMonth;
};

export default updateHistoryActual;