const deleteTransactionFromCategoryActual = (transaction, categories) => {
    const updatedCategories = categories.map(category => {
        let categoryTotal = category.actual;

        if (category.hasSubcategory) {
            const updatedSubcategories = category.subcategories.map(subcategory => {
                let subcategoryTotal = subcategory.actual;

                if (subcategory.name === transaction.category) {
                    subcategoryTotal -= transaction.amount;
                    categoryTotal -= transaction.amount;

                    return {...subcategory, actual: parseFloat(subcategoryTotal.toFixed(2))};
                } else {
                    return subcategory;
                }
            });

            return {...category, actual: parseFloat(categoryTotal.toFixed(2)), subcategories: updatedSubcategories};
        } else if (category.name === transaction.category && !category.hasSubcategory) {
            categoryTotal -= transaction.amount;

            return {...category, actual: parseFloat(categoryTotal.toFixed(2))}
        } else {
            return category;
        }
    });

    return updatedCategories;
}

export default deleteTransactionFromCategoryActual;
