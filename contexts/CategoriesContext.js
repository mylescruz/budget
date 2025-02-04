import useCategories from "@/hooks/useCategories";
import { createContext } from "react";

export const CategoriesContext = createContext({});

export const CategoriesProvider = ({children, monthInfo}) => {
    const { categories, postCategory, putCategories, deleteCategory } = useCategories(monthInfo.month, monthInfo.year);

    return (
        <CategoriesContext.Provider value={{ categories, postCategory, putCategories, deleteCategory }}>
            {children}
        </CategoriesContext.Provider>
    )
}