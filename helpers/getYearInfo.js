const getYearInfo = (year) => {
    const yearInfo = {
        startOfYear: new Date(`01/01/${year}`).toISOString().split('T')[0],
        endOfYear: new Date(`12/31/${year}`).toISOString().split('T')[0]
    }

    return yearInfo;
};

export default getYearInfo;