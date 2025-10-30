// Formats the given date to MM/YYYY

const monthFormatter = (date, option) => {
  const formattedDate = new Date(date);
  return formattedDate.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: option,
    year: "numeric",
  });
};

export default monthFormatter;
