import categorySorter from "@/helpers/categorySorter";
import { useEffect, useState } from "react";

const useCategories = (month, year) => {
    const [categories, setCategories] = useState([]);
    
    useEffect(() => {
        const getCategories = async () => {
            try {
                const rsp = await fetch(`/api/categories/${year}/${month}`);
                const result = await rsp.json();
                const sortedCategories = categorySorter(result);
                setCategories(sortedCategories);
            } catch (err) {
                console.log("Error occured while retrieving categories: ", err);
            }
        }

        getCategories();
    }, [month, year]);

    const postCategory = async (newCategory) => {
        try {
            await fetch(`/api/categories/${year}/${month}`, {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newCategory)
            });
        } catch (err) {
            console.log("Error occurred while adding a category: ", err);
        }
    };

    const putCategories = async (updatedCategories) => {
        try {
            await fetch(`/api/categories/${year}/${month}`, {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedCategories)
            });
        } catch (err) {
            console.log("Error occurred while updating categories: ", err);
        }
    };

    const deleteCategory = async (categoryToDelete) => {
        try {
            await fetch(`/api/categories/${year}/${month}`, {
                method: "DELETE",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(categoryToDelete)
            });
        } catch (err) {
            console.log("Error occurred while deleting a category: ", err);
        }
    };

    const addCategory = (newCategory) => {
        postCategory(newCategory);
        const sortedCategories = categorySorter([...categories, newCategory]);
        setCategories(sortedCategories);
    };

    const updateCategories = (updatedCategories) => {
        putCategories(updatedCategories);
        const sortedCategories = categorySorter(updatedCategories);
        setCategories(sortedCategories);
    };

    const deleteFromCategories = (categoryToDelete) => {
        deleteCategory(categoryToDelete);

        const updatedCategories = categories.filter(category => {
            return category.id !== categoryToDelete.id;
        });
        const sortedCategories = categorySorter(updatedCategories);
        setCategories(sortedCategories);
    };
    
    return { categories, addCategory, updateCategories, deleteFromCategories };
};

export default useCategories;