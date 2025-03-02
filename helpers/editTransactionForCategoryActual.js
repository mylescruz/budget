const editTransactionForCategoryActual = (edittedTransaction, oldTransaction, categories) => {
    const updatedCategories = categories.map(category => {
        let categoryTotal = category.actual;

        if (category.hasSubcategory) {
            const updatedSubcategories = category.subcategories.map(subcategory => {
                let subcategoryTotal = subcategory.actual;

                if (subcategory.name === oldTransaction.category && subcategory.name !== edittedTransaction.category) {
                    if (edittedTransaction.category === oldTransaction.category) {
                        subcategoryTotal = subcategoryTotal - oldTransaction.amount + edittedTransaction.amount;
                        categoryTotal = categoryTotal - oldTransaction.amount + edittedTransaction.amount;
                    }
                    else {
                        subcategoryTotal -= oldTransaction.amount;
                        categoryTotal -= oldTransaction.amount;
                    }

                    return {...subcategory, actual: parseFloat(subcategoryTotal.toFixed(2))};
                } else if (subcategory.name === edittedTransaction.category) {
                    if (edittedTransaction.category !== oldTransaction.category) {
                        subcategoryTotal += edittedTransaction.amount;
                        categoryTotal += edittedTransaction.amount;
                    } else {
                        subcategoryTotal = subcategoryTotal - oldTransaction.amount + edittedTransaction.amount;
                        categoryTotal = categoryTotal - oldTransaction.amount + edittedTransaction.amount;
                    }

                    return {...subcategory, actual: parseFloat(subcategoryTotal.toFixed(2))};
                } else {
                    return subcategory;
                }
            });

            return {...category, actual: parseFloat(categoryTotal.toFixed(2)), subcategories: updatedSubcategories};
        } else if (category.name === oldTransaction.category && !category.hasSubcategory) {
            if (edittedTransaction.category === oldTransaction.category)
                categoryTotal = category.actual - oldTransaction.amount + edittedTransaction.amount;
            else
                categoryTotal -= oldTransaction.amount;

            return {...category, actual: parseFloat(categoryTotal.toFixed(2))};
        } else if (category.name === edittedTransaction.category) {
            categoryTotal += edittedTransaction.amount;

            return {...category, actual: parseFloat(categoryTotal.toFixed(2))}
        } else {
            return category;
        }
    });

    return updatedCategories;
}

export default editTransactionForCategoryActual;
