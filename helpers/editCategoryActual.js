const editCategoryActual = (transaction, oldAmount, categories) => {
    let newCategoryActual = 0;
    const updatedCategories = categories.map(category => {
        if (category.name === transaction.category) {
            newCategoryActual = category.actual - oldAmount + transaction.amount;

            return {
                ...category,
                actual: newCategoryActual
            }
        }

        return category;
    });

    return updatedCategories;
}

export default editCategoryActual;
