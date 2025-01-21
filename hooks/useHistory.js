import { useEffect, useState } from "react";

const useHistory = () => {
    const [history, setHistory] = useState([]);
    
    useEffect(() => {
        const getHistory = async () => {
            try {
                const rsp = await fetch("/api/history");
                const result = await rsp.json();
                setHistory(result);
            } catch (err) {
                console.log("Error occurred while getting the user's history: ", err);
            }
        }

        getHistory();
    }, []);

    const postHistory = async (newHistory) => {
        try {
            await fetch("/api/history", {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newHistory)
            });
        } catch (err) {
            console.log("Error occurred while adding to the user's history: ", err);
        }
    };

    const putHistory = async (edittedHistory) => {
        try {
            await fetch("/api/history", {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(edittedHistory)
            });
        } catch (err) {
            console.log("Error occurred while editting a month's history: ", err);
        }
    };

    const deleteHistory = async (historyToDelete) => {
        try {
            await fetch("/api/history", {
                method: "DELETE",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(historyToDelete)
            });
        } catch (err) {
            console.log("Error occurred while deleting a user's history: ", err);
        }
    };

    const addToHistory = (newHistory) => {
        postHistory(newHistory);

        setHistory([...history, newHistory]);
    };

    const editHistory = (edittedHistory) => {
        putHistory(edittedHistory);

        const updatedHistory = history.map(currentHistory => {
            if (currentHistory.id === edittedHistory.id)
                return edittedHistory;
            else
                return currentHistory;
        });
        
        setHistory(updatedHistory);
    };

    const deleteFromHistory = (historyToDelete) => {
        deleteHistory(historyToDelete);

        const updatedHistory = history.filter(currentHistory => {
            return currentHistory.id !== historyToDelete.id;
        });

        setHistory(updatedHistory);
    };

    return { history, addToHistory, editHistory, deleteFromHistory };
};

export default useHistory;