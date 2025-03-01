const monthFormatter = (date) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("en-US", {timeZone: 'UTC', month: "numeric", year: "numeric"});
}

export default monthFormatter;