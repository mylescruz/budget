import useCategories from "@/hooks/useCategories";
import { createContext } from "react";

export const CategoriesContext = createContext({});

export const CategoriesProvider = ({children}) => {
    const { categories, updateCategories } = useCategories();

    return (
        <CategoriesContext.Provider value={{ categories, updateCategories }}>
            {children}
        </CategoriesContext.Provider>
    )
}