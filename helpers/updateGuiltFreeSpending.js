import dateInfo from "./dateInfo";

const updateGuiltFreeSpending = (paystubs, categories) => {
    let totalIncome = 0;
    paystubs.map(paystub => {
        const paystubDate = new Date(paystub.date);
        const paystubMonth = paystubDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
        if (paystubMonth === dateInfo.currentMonth)
            totalIncome += paystub.net;
    });

    let totalActual = 0;
    let totalBudget = 0;
    categories.forEach(category => {
        if (category.name !== "Guilt Free Spending")
            totalBudget += category.budget;

        totalActual += category.actual;
    });

    const updatedCategories = categories.map(category => {
        if (category.name === "Guilt Free Spending")
            return {...category, budget: totalIncome - totalBudget};
        else
            return category;
    });

    return updatedCategories;
};

export default updateGuiltFreeSpending;