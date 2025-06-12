// Returns an object that gives all the date info for the given month from a date

import getMonthInfo from "./getMonthInfo";

const dateToMonthInfo = (date) => {
  const newDate = new Date(date);
  const dateMonth = newDate.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const dateYear = newDate.getFullYear();

  return getMonthInfo(dateMonth, dateYear);
};

export default dateToMonthInfo;
