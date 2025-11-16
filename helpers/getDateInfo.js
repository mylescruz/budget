const getDateInfo = (date) => {
  const givenDate = new Date(date);
  const month = givenDate.getUTCMonth() + 1;
  const monthName = givenDate.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const year = givenDate.getFullYear();
  const startOfMonth = new Date(`${month}/01/${year}`);
  const endOfMonth = new Date(year, month, 0);

  return {
    date: givenDate.toISOString().split("T")[0],
    month: month,
    monthName: monthName,
    startOfMonth: startOfMonth.toISOString().split("T")[0],
    endOfMonth: endOfMonth.toISOString().split("T")[0],
    year: year,
    startOfYear: new Date(`01/01/${year}`).toISOString().split("T")[0],
    endOfYear: new Date(`12/31/${year}`).toISOString().split("T")[0],
  };
};

export default getDateInfo;
