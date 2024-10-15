import useCategories from "@/hooks/useCategories";
import { createContext } from "react";

export const CategoriesContext = createContext({});

export const CategoriesProvider = ({children}) => {
    const { categories, addCategory, updateCategories } = useCategories();

    return (
        <CategoriesContext.Provider value={{ categories, addCategory, updateCategories }}>
            {children}
        </CategoriesContext.Provider>
    )
}