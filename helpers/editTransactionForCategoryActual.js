// Returns a new categories array with the updated category's actual value when a transaction is editted

const editTransactionForCategoryActual = (edittedTransaction, oldTransaction, categories) => {
    const updatedCategories = categories.map(category => {
        let categoryTotal = category.actual;

        if (category.hasSubcategory) {
            // If a category has a subcategory, map through the subcategories to find the subcategory matching the transaction's category
            const updatedSubcategories = category.subcategories.map(subcategory => {
                let subcategoryTotal = subcategory.actual;

                if (subcategory.name === oldTransaction.category && subcategory.name !== edittedTransaction.category) {
                    // If the subcategory matches the old transaction's category and not the editted one
                    // Subtract the transaction amount to the subcategory's actual value and parent category's actual value
                    subcategoryTotal -= oldTransaction.amount;
                    categoryTotal -= oldTransaction.amount;

                    return {...subcategory, actual: parseFloat(subcategoryTotal.toFixed(2))};
                } else if (subcategory.name === edittedTransaction.category) {
                    // If the subcategory matches the editted transaction's category
                    if (edittedTransaction.category !== oldTransaction.category) {
                        // If the old transaction's category and editted transaction's category are not the same
                        // Add the editted transaction amount to the subcategory's actual value and parent category's actual value
                        subcategoryTotal += edittedTransaction.amount;
                        categoryTotal += edittedTransaction.amount;
                    } else {
                        // If the old transaction's category and editted transaction's category are the same
                        // Add the editted transaction amount and subtract the old transaction amount from the subcategory actual value and parent category's actual value
                        subcategoryTotal = subcategoryTotal - oldTransaction.amount + edittedTransaction.amount;
                        categoryTotal = categoryTotal - oldTransaction.amount + edittedTransaction.amount;
                    }

                    return {...subcategory, actual: parseFloat(subcategoryTotal.toFixed(2))};
                } else {
                    // If no matches, return the subcategory as is
                    return subcategory;
                }
            });

            return {...category, actual: parseFloat(categoryTotal.toFixed(2)), subcategories: updatedSubcategories};
        } else if (category.name === oldTransaction.category && !category.hasSubcategory) {
            // If the category matches the old transaction's category and the category doesn't have a subcategory
            if (edittedTransaction.category === oldTransaction.category) {
                // If the editted transaction's category matches the old transaction's category    
                // Add the editted transaction amount and subtract the old transaction amount from the category's actual value
                categoryTotal = category.actual - oldTransaction.amount + edittedTransaction.amount;
            } else {
                // If the categories don't match, subtract the old transaction's amount from the category's actual value
                categoryTotal -= oldTransaction.amount;
            }

            return {...category, actual: parseFloat(categoryTotal.toFixed(2))};
        } else if (category.name === edittedTransaction.category) {
            // If the category matches the editted transaction's category
            // Add the editted transaction amount to the category's actual value
            categoryTotal += edittedTransaction.amount;

            return {...category, actual: parseFloat(categoryTotal.toFixed(2))}
        } else {
            // If no matches, return the category as is
            return category;
        }
    });

    return updatedCategories;
}

export default editTransactionForCategoryActual;
