import { useEffect, useState } from "react";

const useSummary = (year) => {
    const [summary, setSummary] = useState([]);
    
    useEffect(() => {
        const getSummary = async () => {
            try {
                const rsp = await fetch(`/api/categories/${year}/summary`);
                const result = await rsp.json();
                setSummary(result);
            } catch (err) {
                console.log("Error occurred while getting the category summary: ", err);
            }
        }

        getSummary();
    }, [year]);

    const postSummary = async (newSummary) => {
        try {
            await fetch(`/api/categories/${year}/summary`, {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newSummary)
            });
        } catch (err) {
            console.log("Error occurred while adding to the summary: ", err);
        }
    };

    const addToSummary = (newSummary) => {
        postSummary(newSummary);

        setSummary([...summary, newSummary]);
    };

    return { summary, addToSummary };
};

export default useSummary;