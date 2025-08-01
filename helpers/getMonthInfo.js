// Returns an object that gives all the date info for the given month

const getMonthInfo = (month, year) => {
  const monthNumber = new Date(`${month} 01, ${year}`).getMonth() + 1;
  const monthString =
    monthNumber < 10 ? "0" + monthNumber : monthNumber.toString();
  const startOfMonth = new Date(`${monthNumber}/01/${year}`);
  const endOfMonth = new Date(year, monthNumber, 0);

  const monthInfo = {
    month: month,
    monthNumber: monthNumber,
    monthString: monthString,
    year: year,
    startOfMonthDate: startOfMonth.toISOString().split("T")[0],
    endOfMonthDate: endOfMonth.toISOString().split("T")[0],
  };

  return monthInfo;
};

export default getMonthInfo;
