import { useEffect, useState } from "react";

const useHistory = () => {
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    
    useEffect(() => {
        const getHistory = async () => {
            try {
                const rsp = await fetch("/api/history");
                const result = await rsp.json();
                setHistory(result);
                setHistoryLoading(false);
            } catch (err) {
                console.log("Error occurred while getting the user's history: ", err);
            }
        }

        getHistory();
    }, []);

    const postHistory = async (newHistory) => {
        try {
            const rsp = await fetch("/api/history", {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newHistory)
            });

            const result = await rsp.json();
            setHistory(result);
            setHistoryLoading(false);
        } catch (err) {
            console.log("Error occurred while adding to the user's history: ", err);
        }
    };

    const putHistory = async (edittedHistory) => {
        try {
            const rsp = await fetch("/api/history", {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(edittedHistory)
            });

            const result = await rsp.json();
            setHistory(result);
            setHistoryLoading(false);
        } catch (err) {
            console.log("Error occurred while editting a month's history: ", err);
        }
    };

    const deleteHistory = async (historyToDelete) => {
        try {
            const rsp = await fetch("/api/history", {
                method: "DELETE",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(historyToDelete)
            });

            const result = await rsp.json();
            setHistory(result);
            setHistoryLoading(false);
        } catch (err) {
            console.log("Error occurred while deleting a user's history: ", err);
        }
    };

    return { history, historyLoading, postHistory, putHistory, deleteHistory };
};

export default useHistory;