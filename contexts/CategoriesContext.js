import useCategories from "@/hooks/useCategories";
import { useSession } from "next-auth/react";
import { createContext } from "react";

// Context for the categories array and API calls
// Used throughout the budgetLayout component 

export const CategoriesContext = createContext({});

export const CategoriesProvider = ({children, monthInfo}) => {
    const { data: session } = useSession();

    const { categories, categoriesLoading, postCategory, putCategories, deleteCategory } = useCategories(session.user.username, monthInfo.month, monthInfo.year);

    return (
        <CategoriesContext.Provider value={{ categories, categoriesLoading, postCategory, putCategories, deleteCategory }}>
            {children}
        </CategoriesContext.Provider>
    )
}