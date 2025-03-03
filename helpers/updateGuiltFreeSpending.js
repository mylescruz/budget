// Updates the Guilt Free Spending budget based on the total income and all categories' budgets

const updateGuiltFreeSpending = (totalIncome, categories) => {
    let totalBudget = 0;

    // Go through each category except "Guilt Free Spending" and add the total budget
    categories.forEach(category => {
        if (category.name !== "Guilt Free Spending")
            totalBudget += category.budget;
    });

    // Find the Guilt Free Spending category and update it's budget to the income minus the rest of the budget
    const updatedCategories = categories.map(category => {
        if (category.name === "Guilt Free Spending") {
            const budget = parseFloat(totalIncome - totalBudget.toFixed(2));
            return {...category, budget: budget};
        }
        else
            return category;
    });

    return updatedCategories;
};

export default updateGuiltFreeSpending;