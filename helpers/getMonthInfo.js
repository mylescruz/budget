const getMonthInfo = (month, year) => {
    const monthNumber = new Date(`${month} 01, ${year}`).getMonth() + 1;
    const startOfMonth = new Date(`${monthNumber}/01/${year}`);
    const endOfMonth = new Date(year, monthNumber, 0);

    const monthInfo = {
        month: month,
        monthNumber: monthNumber,
        year: year,
        startOfMonthDate: startOfMonth.toISOString().split('T')[0],
        endOfMonthDate: endOfMonth.toISOString().split('T')[0]
    }

    return monthInfo;
};

export default getMonthInfo;