import useCategories from "@/hooks/useCategories";
import { createContext } from "react";

export const CategoriesContext = createContext({});

export const CategoriesProvider = ({children}) => {
    const { categories, setCategories } = useCategories();

    return (
        <CategoriesContext.Provider value={{ categories, setCategories }}>
            {children}
        </CategoriesContext.Provider>
    )
}