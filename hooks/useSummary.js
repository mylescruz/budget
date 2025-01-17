import { useEffect, useState } from "react";

const useSummary = () => {
    const [summary, setSummary] = useState([]);
    
    useEffect(() => {
        const getSummary = async () => {
            try {
                const rsp = await fetch(`/api/summary`);
                const result = await rsp.json();
                setSummary(result);
            } catch (err) {
                console.log("Error occurred while getting the category summary: ", err);
            }
        }

        getSummary();
    }, []);

    const postSummary = async (newSummary) => {
        try {
            await fetch(`/api/summary`, {
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

    const putSummary = async (edittedSummary) => {
        try {
            await fetch(`/api/summary`, {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(edittedSummary)
            });
        } catch (err) {
            console.log("Error occurred while editting a month's summary: ", err);
        }
    };

    const addToSummary = (newSummary) => {
        postSummary(newSummary);

        setSummary([...summary, newSummary]);
    };

    const editSummary = (edittedSummary) => {
        putSummary(edittedSummary);

        const updatedSummary = summary.map(currentSummary => {
            if (currentSummary.id === edittedSummary.id)
                return edittedSummary;
            else
                return currentSummary;
        });
        
        setSummary(updatedSummary);
    };

    return { summary, addToSummary, editSummary };
};

export default useSummary;