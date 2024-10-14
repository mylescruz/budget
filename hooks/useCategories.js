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

    const postCategories = async (updatedCategories) => {
        try {
            await fetch("/api/categories", {
                method: "POST",
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

    const updateCategories = (updatedCategories) => {
        postCategories(updatedCategories);
        setCategories(updatedCategories);
    };
    
    return { categories, updateCategories };
};

export default useCategories;