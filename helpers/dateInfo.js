const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();
const startOfMonth = new Date(`${currentMonth}/01/${currentYear}`);
const endOfMonth = new Date(currentYear, currentMonth, 0);

const dateInfo = {
    minDate: startOfMonth.toISOString().split('T')[0],
    maxDate: endOfMonth.toISOString().split('T')[0]
};

export default dateInfo;