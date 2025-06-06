// Returns an object that has the start and end of year dates

const getYearInfo = (year) => {
  const yearInfo = {
    year: year,
    startOfYear: new Date(`01/01/${year}`).toISOString().split("T")[0],
    endOfYear: new Date(`12/31/${year}`).toISOString().split("T")[0],
  };

  return yearInfo;
};

export default getYearInfo;
