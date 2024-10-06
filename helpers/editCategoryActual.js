const editCategoryActual = (edittedTransaction, oldTransaction, categories) => {
    const updatedCategories = categories.map(category => {
        let newCategoryActual = 0;

        if (category.name === oldTransaction.category) {
            if (edittedTransaction.category === oldTransaction.category)
                newCategoryActual = category.actual - oldTransaction.amount + edittedTransaction.amount;
            else
                newCategoryActual = category.actual - oldTransaction.amount;

            return {...category, actual: newCategoryActual}
        } else if (category.name === edittedTransaction.category) {
            newCategoryActual = category.actual + edittedTransaction.amount;

            return {...category, actual: newCategoryActual}
        } else {
            return category;
        }
    });

    return updatedCategories;
}

export default editCategoryActual;
