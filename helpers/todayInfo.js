// Gives all the date info needed for the current date

const today = new Date();
const currentDate = new Date(today.toLocaleDateString());
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();
const startOfMonth = new Date(`${currentMonth}/01/${currentYear}`);
const endOfMonth = new Date(currentYear, currentMonth, 0);

const todayInfo = {
  date: currentDate.toISOString().split("T")[0],
  month: currentMonth,
  monthName: currentDate.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  }),
  year: currentYear,
  startOfMonth: startOfMonth.toISOString().split("T")[0],
  endOfMonth: endOfMonth.toISOString().split("T")[0],
};

export default todayInfo;
