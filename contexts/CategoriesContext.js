import useCategories from "@/hooks/useCategories";
import { createContext } from "react";

// Context for the categories array and API calls
// Used throughout the budgetLayout component

export const CategoriesContext = createContext({});

export const CategoriesProvider = ({ children, monthInfo }) => {
  const {
    categories,
    categoriesLoading,
    postCategory,
    putCategory,
    deleteCategory,
    updateCategories,
  } = useCategories(monthInfo.monthString, monthInfo.year);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        categoriesLoading,
        postCategory,
        putCategory,
        deleteCategory,
        updateCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};
