import dateInfo from "@/helpers/dateInfo";
import useCategories from "@/hooks/useCategories";
import { createContext } from "react";

export const CategoriesContext = createContext({});

export const CategoriesProvider = ({children}) => {
    const { categories, postCategory, putCategories, deleteCategory } = useCategories(dateInfo.currentMonth, dateInfo.currentYear);

    return (
        <CategoriesContext.Provider value={{ categories, postCategory, putCategories, deleteCategory }}>
            {children}
        </CategoriesContext.Provider>
    )
}