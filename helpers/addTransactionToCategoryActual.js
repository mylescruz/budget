// Returns a new categories array with the updated category's actual value when a transaction is added

const addTransactionToCategoryActual = (transaction, categories) => {
  const updatedCategories = categories.map((category) => {
    let categoryTotal = category.actual;

    if (category.hasSubcategory) {
      let categoryChanged = false;
      // If a category has a subcategory, map through the subcategories to find the subcategory matching the transaction's category
      const updatedSubcategories = category.subcategories.map((subcategory) => {
        let subcategoryTotal = subcategory.actual;

        if (subcategory.name === transaction.category) {
          // If the subcategory matches the transaction's category
          // Add the transaction amount to the subcategory's actual value and parent category's actual value
          subcategoryTotal += transaction.amount;
          categoryTotal += transaction.amount;

          // Mark the category changed flag
          categoryChanged = true;

          return {
            ...subcategory,
            actual: parseFloat(subcategoryTotal.toFixed(2)),
          };
        } else {
          // If the subcategory does not match, return the subcategory as is
          return subcategory;
        }
      });

      const finalCategory = {
        ...category,
        actual: parseFloat(categoryTotal.toFixed(2)),
        subcategories: updatedSubcategories,
      };

      if (categoryChanged) {
        return { ...finalCategory, updated: true };
      } else {
        return finalCategory;
      }
    } else if (
      category.name === transaction.category &&
      !category.hasSubcategory
    ) {
      // If the category matches the transaction's category and there's no subcategory
      // Add the transaction amount to the category's actual value
      categoryTotal += transaction.amount;

      return {
        ...category,
        actual: parseFloat(categoryTotal.toFixed(2)),
        updated: true,
      };
    } else {
      // If no matches, return the category as is
      return category;
    }
  });

  return updatedCategories;
};

export default addTransactionToCategoryActual;
