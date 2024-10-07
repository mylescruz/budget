const addToCategoryActual = (transaction, categories) => {
    let subcategoryTotal = 0;
    let categoryTotal = 0;

    const updatedCategories = categories.map(category => {
        if (category.hasSubcategory) {
            const updatedSubcategories = category.subcategories.map(subcategory => {
                if (subcategory.name === transaction.category) {
                    subcategoryTotal = subcategory.actual + transaction.amount;
                    categoryTotal = category.actual + subcategoryTotal;

                    return {...subcategory, actual: subcategoryTotal};
                } else {
                    return subcategory;
                }
            });

            return {...category, actual: categoryTotal, subcategories: updatedSubcategories};
        } else if (category.name === transaction.category) {
            categoryTotal = category.actual + transaction.amount;

            return {...category, actual: categoryTotal}
        } else {
            return category;
        }
    });

    return updatedCategories;
}

export default addToCategoryActual;
