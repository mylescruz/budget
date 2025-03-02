const monthFormatter = (date) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("en-US", {timeZone: 'UTC', month: "2-digit", year: "numeric"});
}

export default monthFormatter;