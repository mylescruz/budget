// Returns a new categories array with the updated category's actual value when a transaction is deleted

const deleteTransactionFromCategoryActual = (transaction, categories) => {
    const updatedCategories = categories.map(category => {
        let categoryTotal = category.actual;

        if (category.hasSubcategory) {
            // If a category has a subcategory, map through the subcategories to find the subcategory matching the transaction's category
            const updatedSubcategories = category.subcategories.map(subcategory => {
                let subcategoryTotal = subcategory.actual;

                if (subcategory.name === transaction.category) {
                    // If the subcategory matches the transaction's category
                    // Subtract the transaction amount to the subcategory's actual value and parent category's actual value
                    subcategoryTotal -= transaction.amount;
                    categoryTotal -= transaction.amount;

                    return {...subcategory, actual: parseFloat(subcategoryTotal.toFixed(2))};
                } else {
                    // If the subcategory does not match, return the subcategory as is
                    return subcategory;
                }
            });

            return {...category, actual: parseFloat(categoryTotal.toFixed(2)), subcategories: updatedSubcategories};
        } else if (category.name === transaction.category && !category.hasSubcategory) {
            // If the category matches the transaction's category and there's no subcategory
            // Delete the transaction amount from the category's actual value
            categoryTotal -= transaction.amount;

            return {...category, actual: parseFloat(categoryTotal.toFixed(2))}
        } else {
            // If no matches, return the category as is
            return category;
        }
    });

    return updatedCategories;
}

export default deleteTransactionFromCategoryActual;
