import { useCallback, useEffect, useMemo, useState } from "react";
import useMonthIncome from "./useMonthIncome";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";

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

  return {
    categories,
    categoriesLoading,
    getCategories,
    postCategory,
    putCategory,
    deleteCategory,
    categoryTotals,
    categoryColors,
  };
};

export default useCategories;
