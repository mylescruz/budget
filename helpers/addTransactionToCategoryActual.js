const addTransactionToCategoryActual = (transaction, categories) => {
    const updatedCategories = categories.map(category => {
        let categoryTotal = category.actual;

        if (category.hasSubcategory) {
            const updatedSubcategories = category.subcategories.map(subcategory => {
                let subcategoryTotal = subcategory.actual;

                if (subcategory.name === transaction.category) {
                    subcategoryTotal += transaction.amount;
                    categoryTotal += transaction.amount;

                    return {...subcategory, actual: subcategoryTotal};
                } else {
                    return subcategory;
                }
            });

            return {...category, actual: categoryTotal, subcategories: updatedSubcategories};
        } else if (category.name === transaction.category && !category.hasSubcategory) {
            categoryTotal += transaction.amount;

            return {...category, actual: categoryTotal}
        } else {
            return category;
        }
    });

    return updatedCategories;
}

export default addTransactionToCategoryActual;
