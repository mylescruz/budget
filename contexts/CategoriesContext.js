import dateInfo from "@/helpers/dateInfo";
import useCategories from "@/hooks/useCategories";
import { createContext } from "react";

export const CategoriesContext = createContext({});

export const CategoriesProvider = ({children}) => {
    const { categories, addCategory, updateCategories, deleteFromCategories } = useCategories(dateInfo.currentMonth, dateInfo.currentYear);

    return (
        <CategoriesContext.Provider value={{ categories, addCategory, updateCategories, deleteFromCategories }}>
            {children}
        </CategoriesContext.Provider>
    )
}