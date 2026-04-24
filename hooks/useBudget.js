import addDecimalValues from "@/helpers/addDecimalValues";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";
import { FUN_MONEY } from "@/lib/constants/categories";
import { MONTHS } from "@/lib/constants/date";
import {
  TRANSACTION_TYPES,
  TRANSFER_ACCOUNTS,
} from "@/lib/constants/transactions";
import { useCallback, useEffect, useMemo, useState } from "react";

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

  // Derived memo objects created from transcations
  const transactionTotals = useMemo(() => {
    if (!budget.transactions) {
      return null;
    }

    const totals = budget.transactions.reduce(
      (sum, transaction) => {
        const amount = dollarsToCents(transaction.amount);

        if (transaction.type === TRANSACTION_TYPES.INCOME) {
          sum.income += amount;
        } else if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
          sum.expenses += amount;
        } else {
          if (transaction.toAccount === TRANSFER_ACCOUNTS.CHECKING) {
            sum.toChecking += amount;
          } else {
            sum.toSavings += amount;
          }
        }

        return sum;
      },
      {
        income: 0,
        expenses: 0,
        toChecking: 0,
        toSavings: 0,
      },
    );

    return {
      income: centsToDollars(totals.income),
      expenses: centsToDollars(totals.expenses),
      checkingTransfers: centsToDollars(totals.toChecking),
      savingsTransfers: centsToDollars(totals.toSavings),
    };
  }, [budget.transactions]);

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

      const result = await response.json();

      const { fixedTransactions, ...addedCategory } = result;

      setBudget((prev) => {
        // Add the new category to the categories array
        const updatedCategories = [...prev.categories, addedCategory]
          .map((category) => {
            // Update the month's Fun Money budget
            if (category.name === FUN_MONEY) {
              return {
                ...category,
                budget: subtractDecimalValues(
                  category.budget,
                  addedCategory.budget,
                ),
              };
            } else {
              return category;
            }
          })
          .sort((a, b) => Number(b.budget) - Number(a.budget));

        // For an added variable category, only update the state of the categories array
        if (!addedCategory.fixed) {
          return {
            ...prev,
            categories: updatedCategories,
          };
        }

        // For an added fixed category, return the updated categories array and the added fixed transactions
        const updatedTransactions = [
          ...prev.transactions,
          ...fixedTransactions,
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        return {
          categories: updatedCategories,
          transactions: updatedTransactions,
        };
      });

      setBudgetRequest({
        action: "create",
        status: "success",
        message: `Successfully created the new category: ${newCategory.name}`,
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

      const result = await response.json();

      const { updatedTransactions, ...updatedCategory } = result;

      setBudget((prev) => {
        const updatedCategories = prev.categories
          .map((category) => {
            if (category._id === updatedCategory._id) {
              // Replace the old category with the updated category
              return updatedCategory;
            } else if (category.name === FUN_MONEY) {
              // Update the month's Fun Money budget
              const changedBudget = subtractDecimalValues(
                updatedCategory.budget,
                editedCategory.currentBudget,
              );

              return {
                ...category,
                budget: subtractDecimalValues(category.budget, changedBudget),
              };
            } else {
              return category;
            }
          })
          .sort((a, b) => Number(b.budget) - Number(a.budget));

        // For an updated variable category, only update the state of the categories array
        if (!updatedTransactions) {
          return {
            ...prev,
            categories: updatedCategories,
          };
        }

        // Create a map of the current transactions based on the transaction id
        const transactionsMap = new Map(
          prev.transactions.map((transaction) => [
            transaction._id,
            transaction,
          ]),
        );

        // Set the new transactions in the map or replace the current transaction with the updated one
        updatedTransactions.forEach((transaction) => {
          if (transaction.deleted) {
            transactionsMap.delete(transaction._id);
          } else {
            transactionsMap.set(transaction._id, transaction);
          }
        });

        const formattedTransactions = [...transactionsMap.values()].sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        );

        return {
          categories: updatedCategories,
          transactions: formattedTransactions,
        };
      });

      setBudgetRequest({
        action: "update",
        status: "success",
        message: `Successfully updated the category: ${updatedCategory.name}`,
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

      setBudget((prev) => {
        // Remove the deleted category from the categories array
        const updatedCategories = prev.categories
          .filter((category) => category._id !== deletedCategory._id)
          .map((category) => {
            // Update the month's Fun Money budget
            if (category.name === FUN_MONEY) {
              return {
                ...category,
                budget: addDecimalValues(
                  category.budget,
                  deletedCategory.budget,
                ),
              };
            } else {
              return category;
            }
          });

        // For a deleted variable category, only update the state of the categories array
        if (!deletedCategory.fixed) {
          return {
            ...prev,
            categories: updatedCategories,
          };
        }

        // Delete the fixed parent category or fixed subcategories' correlating transactions
        const updatedTransactions = prev.transactions.filter((transaction) => {
          if (transaction.categoryId === deletedCategory._id) {
            return false;
          } else if (transaction.parentCategoryId === deletedCategory._id) {
            return false;
          } else {
            return true;
          }
        });

        return {
          categories: updatedCategories,
          transactions: updatedTransactions,
        };
      });

      setBudgetRequest({
        action: "delete",
        status: "success",
        message: `Successfully deleted the category: ${deletedCategory.name}`,
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

  // Computes each category's total actual value based on the updated transactions
  const computeCategories = (categories, updatedTransactions) => {
    const categoryTotals = new Map();

    // Get the total amount spent on each category based on transactions
    updatedTransactions.forEach((transaction) => {
      if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
        const categoryKey = transaction.categoryId;

        if (!categoryTotals.has(categoryKey)) {
          categoryTotals.set(categoryKey, 0);
        }

        categoryTotals.set(
          categoryKey,
          categoryTotals.get(categoryKey) + dollarsToCents(transaction.amount),
        );
      }
    });

    // Assign the total amount to the correlating category's actual value
    const updatedCategories = categories.map((category) => {
      let categoryActual = 0;

      // Parent categories with no subcategories
      if (category.subcategories.length === 0) {
        categoryActual = categoryTotals.get(category._id) || 0;

        return {
          ...category,
          actual: centsToDollars(categoryActual),
        };
      }

      // Parent categories with subcategories
      const updatedSubcategories = category.subcategories.map((subcategory) => {
        const subcategoryActual = categoryTotals.get(subcategory._id) || 0;

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
    transactionTotals,
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
