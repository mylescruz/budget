import { useCallback, useEffect, useMemo, useState } from "react";
import useMonthIncome from "./useMonthIncome";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import addDecimalValues from "@/helpers/addDecimalValues";

const useCategories = (month, year) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Get monthly income to compute category totals
  const { monthIncome } = useMonthIncome(month, year);

  const getCategories = useCallback(async (month, year) => {
    setCategoriesLoading(true);

    try {
      const response = await fetch(`/api/categories/${year}/${month}`);

      if (response.ok) {
        const fetchedCategories = await response.json();
        setCategories(fetchedCategories);
      } else {
        const message = await response.text();
        throw new Error(message);
      }
    } catch (error) {
      console.error(error);
      setCategories(null);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    getCategories(month, year);
  }, [month, year, getCategories]);

  const postCategory = useCallback(
    async (newCategory) => {
      try {
        const response = await fetch(`/api/categories/${year}/${month}`, {
          method: "POST",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCategory),
        });

        if (response.ok) {
          const addedCategory = await response.json();

          setCategories([...categories, addedCategory]);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        throw new Error(error);
      } finally {
        setCategoriesLoading(false);
      }
    },
    [categories, year, month],
  );

  const putCategory = useCallback(
    async (updatedCategory) => {
      try {
        const response = await fetch(`/api/category/${updatedCategory._id}`, {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCategory),
        });

        if (response.ok) {
          const updatedCategory = await response.json();

          // Replace old category with new new category in array
          const updatedCategories = [...categories];

          const categoryIndex = updatedCategories.findIndex(
            (cat) => cat._id === updatedCategory._id,
          );

          updatedCategories[categoryIndex] = updatedCategory;

          if (categoryIndex !== -1) {
            setCategories(updatedCategories);
          } else {
            throw new Error(`Could not find category ${updatedCategory.name}`);
          }
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        throw new Error(error);
      } finally {
        setCategoriesLoading(false);
      }
    },
    [categories],
  );

  const deleteCategory = useCallback(
    async (categoryId) => {
      try {
        const response = await fetch(`/api/category/${categoryId}`, {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const updatedCategories = categories.filter((category) => {
            return category._id !== categoryId;
          });

          setCategories(updatedCategories);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        throw new Error(error);
      } finally {
        setCategoriesLoading(false);
      }
    },
    [categories],
  );

  // Update the state of the categories with the added, edited or deleted transaction
  const updateCategoriesFromTransaction = useCallback(
    ({ oldTransaction, newTransaction }) => {
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
    },
    [],
  );

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

            sum.categoryActuals += subcategoryActual;
            sum.fixedActual += subcategoryActual;
            sum.fixedBudget += subcategoryBudget;
          });
        } else if (category.fixed && category.subcategories.length === 0) {
          sum.fixedBudget += categoryBudget;

          sum.categoryActuals += categoryActual;
          sum.fixedActual += categoryActual;
        } else {
          sum.variableBudget += categoryBudget;
          sum.categoryActuals += categoryActual;
          sum.variableActual += categoryActual;
        }

        return sum;
      },
      {
        categoryActuals: 0,
        fixedBudget: 0,
        fixedActual: 0,
        variableBudget: 0,
        variableActual: 0,
      },
    );

    const totalRemaining = dollarsToCents(monthIncome) - totals.categoryActuals;
    const variableRemaining = totals.variableBudget - totals.variableActual;

    return {
      income: monthIncome,
      actual: centsToDollars(totals.categoryActuals),
      remaining: centsToDollars(totalRemaining),
      fixedBudget: centsToDollars(totals.fixedBudget),
      fixedActual: centsToDollars(totals.fixedActual),
      variableBudget: centsToDollars(totals.variableBudget),
      variableActual: centsToDollars(totals.variableActual),
      variableRemaining: centsToDollars(variableRemaining),
    };
  }, [categories, monthIncome, month, year]);

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
    categoriesLoading,
    getCategories,
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
