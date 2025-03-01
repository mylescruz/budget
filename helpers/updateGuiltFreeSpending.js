const updateGuiltFreeSpending = (totalIncome, categories) => {
    let totalActual = 0;
    let totalBudget = 0;

    categories.forEach(category => {
        if (category.name !== "Guilt Free Spending")
            totalBudget += category.budget;

        totalActual += category.actual;
    });

    const updatedCategories = categories.map(category => {
        if (category.name === "Guilt Free Spending") {
            const budget = (totalIncome - totalBudget).toFixed(2);
            return {...category, budget: budget};
        }
        else
            return category;
    });

    return updatedCategories;
};

export default updateGuiltFreeSpending;