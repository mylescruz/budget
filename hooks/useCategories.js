import categorySorter from "@/helpers/categorySorter";
import { useCallback, useEffect, useMemo, useState } from "react";
import useMonthIncome from "./useMonthIncome";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";

const useCategories = (month, year) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Get monthly income to compute category totals
  const { monthIncome } = useMonthIncome(month, year);

  const getCategories = useCallback(async (month, year) => {
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
          setCategories(categorySorter([...categories, addedCategory]));
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
    [categories, year, month]
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
            (cat) => cat._id === updatedCategory._id
          );

          updatedCategories[categoryIndex] = updatedCategory;

          if (categoryIndex !== -1) {
            setCategories(categorySorter(updatedCategories));
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
    [categories]
  );

  const deleteCategory = useCallback(
    async (category) => {
      try {
        const response = await fetch(`/api/category/${category._id}`, {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const deletedCategory = await response.json();

          const updatedCategories = categories.filter((category) => {
            return category._id !== deletedCategory._id;
          });

          setCategories(categorySorter(updatedCategories));
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
    [categories]
  );

  // Gets the total budget, actual and remaining for categories
  // Budget: Based on amount value from income
  // Actual:
  //  - If a category or subcategory's date of charge is greater than today, add that value to the total actual values
  //  - If no dayOfMonth field, just sum all categories' actual values
  const categoryTotals = useMemo(() => {
    const today = new Date();

    let categoryActuals = 0;
    categories.forEach((category) => {
      if (category.fixed && category.subcategories.length > 0) {
        category.subcategories.forEach((subcategory) => {
          if (subcategory.dayOfMonth) {
            const day = subcategory.dayOfMonth;
            const subcategoryDate = new Date(`${month}/${day}/${year}`);

            if (subcategoryDate <= today) {
              categoryActuals += subcategory.actual * 100;
            }
          } else {
            categoryActuals += subcategory.actual * 100;
          }
        });
      } else if (category.fixed && category.subcategories.length === 0) {
        if (category.dayOfMonth) {
          const day = category.dayOfMonth;
          const categoryDate = new Date(`${month}/${day}/${year}`);

          if (categoryDate <= today) {
            categoryActuals += category.actual * 100;
          }
        } else {
          categoryActuals += category.actual * 100;
        }
      } else {
        categoryActuals += category.actual * 100;
      }
    });

    const actualValue = categoryActuals / 100;
    const remaining = subtractDecimalValues(monthIncome, actualValue);

    return {
      budget: monthIncome,
      actual: actualValue,
      remaining: remaining,
    };
  }, [categories, monthIncome]);

  // Define all the category and subcategory's correlating colors
  const categoryColors = useMemo(() => {
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
