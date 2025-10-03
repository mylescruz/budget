import useCategories from "@/hooks/useCategories";
import { createContext } from "react";

// Context for the categories array and API calls
// Used throughout the budgetLayout component

export const CategoriesContext = createContext({});

export const CategoriesProvider = ({ children, dateInfo }) => {
  const {
    categories,
    categoriesLoading,
    getCategories,
    postCategory,
    updateCategories,
    deleteCategory,
  } = useCategories(dateInfo.month, dateInfo.year);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        categoriesLoading,
        getCategories,
        postCategory,
        updateCategories,
        deleteCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};
