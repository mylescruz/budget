import { useEffect, useState } from "react";

const useCategories = (month, year) => {
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    
    useEffect(() => {
        const getCategories = async () => {
            try {
                const rsp = await fetch(`/api/categories/${year}/${month}`);
                const result = await rsp.json();
                setCategories(result);
                setCategoriesLoading(false);
            } catch (err) {
                console.log("Error occured while retrieving categories: ", err);
            }
        }

        getCategories();
    }, [month, year]);

    const postCategory = async (newCategory) => {
        try {
            const rsp = await fetch(`/api/categories/${year}/${month}`, {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newCategory)
            });

            const result = await rsp.json();
            setCategories(result);
            setCategoriesLoading(false);
        } catch (err) {
            console.log("Error occurred while adding a category: ", err);
        }
    };

    const putCategories = async (updatedCategories) => {
        try {
            const rsp = await fetch(`/api/categories/${year}/${month}`, {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedCategories)
            });

            const result = await rsp.json();
            setCategories(result);
            setCategoriesLoading(false);
        } catch (err) {
            console.log("Error occurred while updating categories: ", err);
        }
    };

    const deleteCategory = async (categoryToDelete) => {
        try {
            const rsp = await fetch(`/api/categories/${year}/${month}`, {
                method: "DELETE",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(categoryToDelete)
            });

            const result = await rsp.json();
            setCategories(result);
            setCategoriesLoading(false);
        } catch (err) {
            console.log("Error occurred while deleting a category: ", err);
        }
    };
    
    return { categories, categoriesLoading, postCategory, putCategories, deleteCategory };
};

export default useCategories;