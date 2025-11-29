import categorySorter from "@/helpers/categorySorter";
import { useCallback, useEffect, useMemo, useState } from "react";
import useMonthIncome from "./useMonthIncome";

const useCategories = (month, year) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Get monthly income to compute category totals
  const { monthIncome } = useMonthIncome(month, year);

  const getCategories = useCallback(async () => {
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
  }, [month, year]);

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
    [categories]
  );

  const categoryTotals = useMemo(() => {
    const categoryActuals = categories.reduce(
      (sum, current) => sum + current.actual,
      0
    );

    return {
      budget: monthIncome,
      actual: categoryActuals,
      remaining: monthIncome - categoryActuals,
    };
  }, [categories, monthIncome]);

  // Define all the category and subcategory's correlating colors
  const categoryColors = useMemo(() => {
    const colors = {};

    categories.forEach((category) => {
      if (!category.fixed) {
        if (category.subcategories.length === 0) {
          colors[category.name] = category.color;
        } else {
          category.subcategories.forEach((subcategory) => {
            colors[subcategory.name] = category.color;
          });
        }
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
