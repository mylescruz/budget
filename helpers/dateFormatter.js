const dateFormatter = (date) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("en-US", {timeZone: 'UTC'});
}

export default dateFormatter;