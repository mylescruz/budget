import addDecimalValues from "@/helpers/addDecimalValues";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";
import { FUN_MONEY } from "@/lib/constants/categories";
import { MONTHS } from "@/lib/constants/date";
import { useCallback, useEffect, useState } from "react";

const useBudget = (month, year) => {
  const [budget, setBudget] = useState({
    categories: null,
    transactions: null,
  });
  const [budgetRequest, setBudgetRequest] = useState({
    action: "get", // get | create | update | delete
    status: "loading", // loading | success | error
    message: `Loading your budget for ${MONTHS[month]} ${year}`,
  });

  // Fetch a user's categories and transactions for the current month
  const getBudget = useCallback(async () => {
    setBudgetRequest({
      action: "get",
      status: "loading",
      message: `Loading your budget for ${MONTHS[month]} ${year}`,
    });

    try {
      const response = await fetch(`/api/budget/${year}/${month}`);

      if (!response.ok) {
        const message = await response.text();

        throw new Error(message);
      }

      const fetchedBudget = await response.json();

      setBudget({
        categories: fetchedBudget.categories,
        transactions: fetchedBudget.transactions,
      });

      setBudgetRequest({
        action: "get",
        status: "success",
        message: "Successfully loaded your budget",
      });
    } catch (error) {
      //   throw error;
      setBudgetRequest({
        action: "get",
        status: "error",
        message: error.message,
      });
    }
  }, [month, year]);

  useEffect(() => {
    getBudget();
  }, [getBudget]);

  // Derived memo objects created from categories

  // Get the total budget, actual and remaining values for both fixed and variable categories
  const categoryTotals = useMemo(() => {
    if (!budget.categories) {
      return null;
    }

    const totals = budget.categories.reduce(
      (sum, category) => {
        const categoryBudget = dollarsToCents(category.budget);
        const categoryActual = dollarsToCents(category.actual);

        if (category.fixed && category.subcategories.length > 0) {
          category.subcategories.forEach((subcategory) => {
            const subcategoryActual = dollarsToCents(subcategory.actual);
            const subcategoryBudget = dollarsToCents(subcategory.budget);

            sum.categoryBudget += subcategoryBudget;
            sum.categoryActuals += subcategoryActual;
            sum.fixedActual += subcategoryActual;
            sum.fixedBudget += subcategoryBudget;
          });
        } else if (category.fixed && category.subcategories.length === 0) {
          sum.categoryBudget += categoryBudget;
          sum.fixedBudget += categoryBudget;

          sum.categoryActuals += categoryActual;
          sum.fixedActual += categoryActual;
        } else {
          sum.categoryBudget += categoryBudget;
          sum.variableBudget += categoryBudget;
          sum.categoryActuals += categoryActual;
          sum.variableActual += categoryActual;
        }

        return sum;
      },
      {
        categoryBudget: 0,
        categoryActuals: 0,
        fixedBudget: 0,
        fixedActual: 0,
        variableBudget: 0,
        variableActual: 0,
      },
    );

    const variableRemaining = totals.variableBudget - totals.variableActual;

    return {
      budget: centsToDollars(totals.categoryBudget),
      actual: centsToDollars(totals.categoryActuals),
      fixedBudget: centsToDollars(totals.fixedBudget),
      fixedActual: centsToDollars(totals.fixedActual),
      variableBudget: centsToDollars(totals.variableBudget),
      variableActual: centsToDollars(totals.variableActual),
      variableRemaining: centsToDollars(variableRemaining),
    };
  }, [budget.categories]);

  // Define all the category and subcategory's correlating colors
  const categoryColors = useMemo(() => {
    if (!budget.categories) {
      return null;
    }

    const colors = {};

    budget.categories.forEach((category) => {
      if (category.subcategories.length === 0) {
        colors[category.name] = category.color;
      } else {
        category.subcategories.forEach((subcategory) => {
          colors[subcategory.name] = category.color;
        });
      }
    });

    return colors;
  }, [budget.categories]);

  // Create a set of the user's categories so a user cannot create a category with the same name
  const categoryNames = useMemo(() => {
    if (!budget.categories) {
      return null;
    }

    const names = new Set();

    budget.categories.forEach((category) => {
      names.add(category.name);

      category.subcategories.forEach((subcategory) => {
        names.add(subcategory.name);
      });
    });

    return names;
  }, [budget.categories]);

  // Transaction mutation methods

  const postTransactions = async (newTransactions) => {
    setBudgetRequest({
      action: "create",
      status: "loading",
      message: `Adding your transaction${newTransactions.length > 1 && "s"} to your budget`,
    });

    try {
      const response = await fetch(`/api/transactions/${year}/${month}`, {
        method: "POST",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransactions),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const addedTransactions = await response.json();

      // Add the new transaction(s) to the transactions state
      setBudget((prev) => {
        const updatedTransactions = [
          ...prev.transactions,
          ...addedTransactions,
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Re-calculate each category's actual value
        const updatedCategories = computeCategories(
          prev.categories,
          updatedTransactions,
        );

        return {
          categories: updatedCategories,
          transactions: updatedTransactions,
        };
      });

      setBudgetRequest({
        action: "create",
        status: "success",
        message: `Successfully added your new transaction${newTransactions.length > 1 && "s"}`,
      });
    } catch (error) {
      setBudgetRequest({
        action: "create",
        status: "error",
        message: error.message,
      });

      throw error;
    }
  };

  const putTransaction = async (editedTransaction) => {
    setBudgetRequest({
      action: "update",
      status: "loading",
      message: "Updating this transaction",
    });

    try {
      const response = await fetch(
        `/api/transaction/${editedTransaction._id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedTransaction),
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const updatedTransaction = await response.json();

      // Replace the updated transaction in the transactions state
      setBudget((prev) => {
        const updatedTransactions = prev.transactions.map((transaction) =>
          transaction._id === updatedTransaction._id
            ? updatedTransaction
            : transaction,
        );

        // Re-calculate each category's actual value
        const updatedCategories = computeCategories(
          prev.categories,
          updatedTransactions,
        );

        return {
          categories: updatedCategories,
          transactions: updatedTransactions,
        };
      });

      setBudgetRequest({
        action: "update",
        status: "success",
        message: "Successfully updated this transaction!",
      });
    } catch (error) {
      setBudgetRequest({
        action: "update",
        status: "error",
        message: error.message,
      });

      throw error;
    }
  };

  const deleteTransaction = async (deletedTransaction) => {
    setBudgetRequest({
      action: "delete",
      status: "loading",
      message: "Deleting this transaction",
    });

    try {
      const response = await fetch(
        `/api/transaction/${deletedTransaction._id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      // Delete the transaction in the transactions state
      setBudget((prev) => {
        const updatedTransactions = prev.transactions.filter(
          (transaction) => transaction._id !== deletedTransaction._id,
        );

        // Re-calculate each category's actual value
        const updatedCategories = computeCategories(
          prev.categories,
          updatedTransactions,
        );

        return {
          categories: updatedCategories,
          transactions: updatedTransactions,
        };
      });

      setBudgetRequest({
        action: "delete",
        status: "success",
        message: "Successfully deleted the transaction",
      });
    } catch (error) {
      setBudgetRequest({
        action: "delete",
        status: "error",
        message: error.message,
      });

      throw error;
    }
  };

  // Categories mutation methods

  const postCategory = async (newCategory) => {
    setBudgetRequest({
      action: "create",
      status: "loading",
      message: `Adding the new category: ${newCategory.name}`,
    });

    try {
      const response = await fetch(`/api/categories/${year}/${month}`, {
        method: "POST",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const addedCategory = await response.json();

      setBudgetRequest({
        action: "create",
        status: "success",
        message: `Successfully created the new category: ${newCategory.name}`,
      });

      await getBudget();
    } catch (error) {
      setBudgetRequest({
        action: "create",
        status: "error",
        message: error.message,
      });

      throw error;
    }
  };

  const putCategory = async (editedCategory) => {
    setBudgetRequest({
      action: "update",
      status: "loading",
      message: `Updating the ${editedCategory.name} category`,
    });

    try {
      const response = await fetch(`/api/category/${editedCategory._id}`, {
        method: "PUT",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedCategory),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const updatedCategory = await response.json();

      setBudgetRequest({
        action: "update",
        status: "success",
        message: `Successfully updated the category: ${updatedCategory.name}`,
      });

      await getBudget();
    } catch (error) {
      setBudgetRequest({
        action: "update",
        status: "error",
        message: error.message,
      });

      throw error;
    }
  };

  const deleteCategory = async (deletedCategory) => {
    setBudgetRequest({
      action: "delete",
      status: "loading",
      message: `Deleting the category: ${deletedCategory.name}`,
    });

    try {
      const response = await fetch(`/api/category/${deletedCategory._id}`, {
        method: "DELETE",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deletedCategory),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      setBudgetRequest({
        action: "delete",
        status: "success",
        message: `Successfully deleted the category: ${deletedCategory.name}`,
      });

      await getBudget();
    } catch (error) {
      setBudgetRequest({
        action: "delete",
        status: "error",
        message: error.message,
      });

      throw error;
    }
  };

  // Computes each category's total actual value based on the updated transactions
  const computeCategories = (categories, updatedTransactions) => {
    const categoryTotals = new Map();

    // Get the total amount spent on each category based on transactions
    updatedTransactions.forEach((transaction) => {
      const categoryKey = transaction.categoryId.toString();

      if (!categoryTotals.has(categoryKey)) {
        categoryTotals.set(categoryKey, 0);
      }

      categoryTotals.set(
        categoryKey,
        categoryTotals.get(categoryKey) + dollarsToCents(transaction.amount),
      );
    });

    // Assign the total amount to the correlating category's actual value
    const updatedCategories = categories.map((category) => {
      let categoryActual = 0;

      // Parent categories with no subcategories
      if (category.subcategories.length === 0) {
        categoryActual = categoryTotals.get(category._id.toString()) || 0;

        return {
          ...category,
          actual: centsToDollars(categoryActual),
        };
      }

      // Parent categories with subcategories
      const updatedSubcategories = category.subcategories.map((subcategory) => {
        const subcategoryActual =
          categoryTotals.get(subcategory._id.toString()) || 0;

        categoryActual += subcategoryActual;

        return {
          ...subcategory,
          actual: centsToDollars(subcategoryActual),
        };
      });

      return {
        ...category,
        actual: centsToDollars(categoryActual),
        subcategories: updatedSubcategories,
      };
    });

    return updatedCategories;
  };

  return {
    categories: budget.categories,
    transactions: budget.transactions,
    budgetRequest,
    categoryTotals,
    categoryColors,
    categoryNames,
    postTransactions,
    putTransaction,
    deleteTransaction,
    postCategory,
    putCategory,
    deleteCategory,
  };
};

export default useBudget;
