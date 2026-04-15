import { useEffect, useMemo, useState } from "react";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import addDecimalValues from "@/helpers/addDecimalValues";
import { FUN_MONEY } from "@/lib/constants/categories";
import { TRANSFER_ACCOUNTS } from "@/lib/constants/transactions";

// Fetches and returns the user's categories for a given month and year.
// Each category includes its budget, actual spending, and any nested subcategories.
// Fixed categories may include additional scheduling fields.
//
// Return value:
// [
//   {
//     _id: string,
//     name: string,
//     color: string,
//     fixed: boolean,
//     budget: number,              // in USD
//     actual: number,              // in USD (includes subcategories)
//     subcategories: [
//       {
//         _id: string,
//         name: string,
//         fixed: boolean,
//         parentCategoryId: string,
//         budget?: number,         // in USD, only if fixed
//         actual: number,          // in USD
//         frequency?: string,      // "Monthly" | "Semi-Annually" | "Annually", only if fixed
//         dueDate?: number         // only if fixed
//       }
//     ],
//     frequency?: string,          // "Monthly" | "Semi-Annually" | "Annually", only if fixed with no subcategories:
//     dueDate?: number,            // only if fixed with no subcategories
//     noDelete?: boolean           // present for protected category: Fun Money
//   }
// ]

const useCategories = (month, year) => {
  const [categories, setCategories] = useState(null);
  const [categoriesRequest, setCategoriesRequest] = useState({
    action: "get", // get | create | update | delete
    status: "loading", // loading | success | error
    message: "Getting your categories for the month",
  });

  useEffect(() => {
    getCategories();
  }, [month, year]);

  const getCategories = async () => {
    setCategoriesRequest({
      action: "get",
      status: "loading",
      message: "Getting your categories for the month",
    });

    try {
      const response = await fetch(`/api/categories/${year}/${month}`);

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const fetchedCategories = await response.json();

      setCategories(fetchedCategories);

      setCategoriesRequest({ action: "get", status: "success", message: null });
    } catch (error) {
      setCategoriesRequest({
        action: "get",
        status: "error",
        message: error.message,
      });
    }
  };

  const postCategory = async (newCategory) => {
    setCategoriesRequest({
      action: "create",
      status: "loading",
      message: "Adding the new category",
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

      setCategories((prev) => {
        // Add the new category to the user's categories
        const updatedCategories = [...prev, addedCategory];

        // Update the Fun Money's budget based on the new category's budget
        return updatedCategories.map((category) => {
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
        });
      });

      setCategoriesRequest({
        action: "create",
        status: "success",
        message: `Successfully created the new category: ${newCategory.name}!`,
      });
    } catch (error) {
      setCategoriesRequest({
        action: "create",
        status: "error",
        message: error.message,
      });

      throw error;
    }
  };

  const putCategory = async (editedCategory) => {
    setCategoriesRequest({
      action: "update",
      status: "loading",
      message: "Updating the category's details",
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

      setCategories((prev) => {
        return prev
          .map((category) => {
            if (category._id === updatedCategory._id) {
              // Replace old category with the new category
              return updatedCategory;
            } else if (category.name === FUN_MONEY) {
              // Update the Fun Money's budget based on the edited category's new and old budget
              const updateAmount = subtractDecimalValues(
                updatedCategory.budget,
                editedCategory.currentBudget,
              );

              return {
                ...category,
                budget: subtractDecimalValues(category.budget, updateAmount),
              };
            } else {
              return category;
            }
          })
          .sort((a, b) => b.budget - a.budget);
      });

      setCategoriesRequest({
        action: "update",
        status: "success",
        message: `Successfully updated the category: ${editedCategory.name}!`,
      });
    } catch (error) {
      setCategoriesRequest({
        action: "update",
        status: "error",
        message: error.message,
      });

      throw error;
    }
  };

  const deleteCategory = async (deletedCategory) => {
    setCategoriesRequest({
      action: "delete",
      status: "loading",
      message: "Deleting the category",
    });

    try {
      const response = await fetch(`/api/category/${deletedCategory._id}`, {
        method: "DELETE",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      setCategories((prev) => {
        return prev
          .filter((category) => {
            // Remove the deleted category from the budget
            return category._id !== deletedCategory._id;
          })
          .map((category) => {
            // Update the Fun Money's budget based on the new category's budget
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
          })
          .sort((a, b) => b.budget - a.budget);
      });

      setCategoriesRequest({
        action: "delete",
        status: "success",
        message: `Successfully deleted the category: ${deletedCategory.name}`,
      });
    } catch (error) {
      setCategoriesRequest({
        action: "delete",
        status: "error",
        message: error.message,
      });

      throw new Error(error);
    }
  };

  // Update the state of the categories with the added, edited or deleted transaction
  const updateCategoriesFromTransaction = ({
    oldTransaction,
    newTransaction,
  }) => {
    if (
      (newTransaction && newTransaction.type === "Expense") ||
      (oldTransaction && oldTransaction.type === "Expense")
    ) {
      let oldAmount = oldTransaction && oldTransaction.amount;
      let newAmount = newTransaction && newTransaction.amount;

      if (
        oldTransaction &&
        newTransaction &&
        oldTransaction.categoryId === newTransaction.categoryId
      ) {
        newAmount = subtractDecimalValues(
          newTransaction.amount,
          oldTransaction.amount,
        );

        oldTransaction = null;
      }

      setCategories((prev) => {
        return [...prev].map((category) => {
          if (!category.fixed) {
            if (category.subcategories.length > 0) {
              let categoryActual = category.actual;

              const updatedSubcategories = category.subcategories.map(
                (subcategory) => {
                  if (
                    newTransaction &&
                    subcategory._id === newTransaction.categoryId
                  ) {
                    // Update the subcategory's actual value with the new transaction amount
                    const updatedActual = addDecimalValues(
                      subcategory.actual,
                      newAmount,
                    );

                    // Update the parent category's actual value with the new transaction amount
                    categoryActual = addDecimalValues(
                      categoryActual,
                      newAmount,
                    );

                    return {
                      ...subcategory,
                      actual: updatedActual,
                    };
                  } else if (
                    oldTransaction &&
                    subcategory._id === oldTransaction.categoryId
                  ) {
                    // Update the subcategory's actual value with the old transaction amount
                    const updatedActual = subtractDecimalValues(
                      subcategory.actual,
                      oldAmount,
                    );

                    // Update the parent category's actual value with the old transaction amount
                    categoryActual = subtractDecimalValues(
                      categoryActual,
                      newAmount,
                    );

                    return {
                      ...subcategory,
                      actual: updatedActual,
                    };
                  } else {
                    return subcategory;
                  }
                },
              );

              return {
                ...category,
                actual: categoryActual,
                subcategories: updatedSubcategories,
              };
            } else {
              if (
                newTransaction &&
                category._id === newTransaction.categoryId
              ) {
                // Update the category's actual value with the new transaction amount
                const updatedActual = addDecimalValues(
                  category.actual,
                  newAmount,
                );

                return {
                  ...category,
                  actual: updatedActual,
                };
              } else if (
                oldTransaction &&
                category._id === oldTransaction.categoryId
              ) {
                // Update the category's actual value with the old transaction amount
                const updatedActual = subtractDecimalValues(
                  category.actual,
                  oldAmount,
                );

                return {
                  ...category,
                  actual: updatedActual,
                };
              } else {
                return category;
              }
            }
          } else {
            return category;
          }
        });
      });
    } else {
      // Update the Fun Money budget for any transfers that occur
      let oldAmount = oldTransaction && oldTransaction.amount;
      let newAmount = newTransaction && newTransaction.amount;

      // If transferring to their savings, reduce the Fun Money budget
      if (
        newTransaction &&
        newTransaction.toAccount === TRANSFER_ACCOUNTS.SAVINGS
      ) {
        newAmount *= -1;
      }

      // If transfering to their checking, add to the Fun Money budget
      if (
        oldTransaction &&
        oldTransaction.toAccount === TRANSFER_ACCOUNTS.CHECKING
      ) {
        oldAmount *= -1;
      }

      // Finalize the increment amount based on adding, editing or deleting a transfer
      let updateAmount = 0;

      if (oldTransaction && newTransaction) {
        updateAmount = addDecimalValues(newAmount, oldAmount);
      } else if (!oldTransaction && newTransaction) {
        updateAmount = newAmount;
      } else {
        updateAmount = oldAmount;
      }

      // Increment the Fun Money's budget with the new transfer amount
      setCategories((prev) => {
        return [...prev].map((category) => {
          if (category.name === FUN_MONEY) {
            return {
              ...category,
              budget: addDecimalValues(category.budget, updateAmount),
            };
          } else {
            return category;
          }
        });
      });
    }
  };

  // Get the total budget, actual and remaining values for both fixed and variable categories
  const categoryTotals = useMemo(() => {
    if (!categories) {
      return null;
    }

    const totals = categories.reduce(
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
  }, [categories]);

  // Define all the category and subcategory's correlating colors
  const categoryColors = useMemo(() => {
    if (!categories) {
      return null;
    }

    const colors = {};

    categories.forEach((category) => {
      if (category.subcategories.length === 0) {
        colors[category.name] = category.color;
      } else {
        category.subcategories.forEach((subcategory) => {
          colors[subcategory.name] = category.color;
        });
      }
    });

    return colors;
  }, [categories]);

  // Create a set of the user's categories so a user cannot create a category with the same name
  const categoryNames = useMemo(() => {
    if (!categories) {
      return null;
    }

    const names = new Set();

    categories.forEach((category) => {
      names.add(category.name);

      category.subcategories.forEach((subcategory) => {
        names.add(subcategory.name);
      });
    });

    return names;
  }, [categories]);

  return {
    categories,
    categoriesRequest,
    postCategory,
    putCategory,
    deleteCategory,
    updateCategoriesFromTransaction,
    categoryTotals,
    categoryColors,
    categoryNames,
  };
};

export default useCategories;
