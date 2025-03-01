const dateFormatter = (date) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("en-US", {timeZone: 'UTC', month: "numeric", day: "numeric", year: "2-digit"});
}

export default dateFormatter;