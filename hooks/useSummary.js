import { useEffect, useState } from "react";

const useSummary = (year) => {
    const [summary, setSummary] = useState([]);
    
    useEffect(() => {
        const getCategories = async () => {
            try {
                const rsp = await fetch(`/api/categories/${year}/summary`);
                const result = await rsp.json();
                setSummary(result);
            } catch (err) {
                console.log("Error occurred while getting the category summary: ", err);
            }
        }

        getCategories();
    }, [year]);

    return { summary };
};

export default useSummary;