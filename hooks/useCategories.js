import { useEffect, useState } from "react";

const useCategories = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const getCategories = async () => {
            try {
                const rsp = await fetch("/api/categories/");
                const result = await rsp.json();
                setCategories(result);
            } catch (err) {
                console.log("Error occured while retrieving categories: ", err);
            }
        }
        getCategories();
    }, [setCategories]);
    
    return { categories, setCategories };
};

export default useCategories;