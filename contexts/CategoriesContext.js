import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const CategoriesContext = createContext({});

export const CategoriesProvider = ({children}) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axios
        .get("/db/categories.json")
        .then((res) => {
            // console.log(res.data.categories);
            setCategories(res.data.categories);
        })
        .catch((err) => console.log(err));
    }, []);

    return (
        <CategoriesContext.Provider value={{ categories, setCategories }}>
            {children}
        </CategoriesContext.Provider>
    )
}