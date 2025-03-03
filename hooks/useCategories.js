import { useEffect, useState } from "react";

const useCategories = (username, month, year) => {
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    
    // GET request that returns all the categories based on the username, year and month
    useEffect(() => {
        const getCategories = async () => {
            try {
                const rsp = await fetch(`/api/categories/${username}/${year}/${month}`);
                const result = await rsp.json();
                setCategories(result);
                setCategoriesLoading(false);
            } catch (err) {
                console.log("Error occured while retrieving categories: ", err);
            }
        }

        getCategories();
    }, [username, month, year]);

    // POST request that adds a new category based on the username, year and month
    // Then it sets the categories array to the array returned by the response
    const postCategory = async (newCategory) => {
        try {
            const rsp = await fetch(`/api/categories/${username}/${year}/${month}`, {
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

    // PUT request that updates all the categories based on the username, year and month
    // Then it sets the categories array to the array returned by the response
    const putCategories = async (updatedCategories) => {
        try {
            const rsp = await fetch(`/api/categories/${username}/${year}/${month}`, {
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

    // DELETE request that deletes a category based on the username, year and month
    // Then it sets the categories array to the array returned by the response
    const deleteCategory = async (categoryToDelete) => {
        try {
            const rsp = await fetch(`/api/categories/${username}/${year}/${month}`, {
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