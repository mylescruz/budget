import { useEffect, useState } from "react";

const useHistory = (username) => {
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    
    // GET request that returns the user's history based on the username
    useEffect(() => {
        const getHistory = async () => {
            try {
                const rsp = await fetch(`/api/history/${username}/history`);
                const result = await rsp.json();
                setHistory(result);
                setHistoryLoading(false);
            } catch (err) {
                console.log("Error occurred while getting the user's history: ", err);
            }
        }

        getHistory();
    }, [username]);

    // POST request that adds a month to the user's history based on the username
    // Then it sets the history array to the array returned by the response
    const postHistory = async (newHistory) => {
        try {
            const rsp = await fetch(`/api/history/${username}/history`, {
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

    // PUT request that updates a month's values in the user's history based on the username
    // Then it sets the history array to the array returned by the response
    const putHistory = async (edittedHistory) => {
        try {
            const rsp = await fetch(`/api/history/${username}/history`, {
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

    // DELETE request that deletes a month from the user's history based on the username
    // Then it sets the history array to the array returned by the response
    const deleteHistory = async (historyToDelete) => {
        try {
            const rsp = await fetch(`/api/history/${username}/history`, {
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

    // Function that returns a user's history for a single month based on the given month and year
    const getMonthHistory = (monthInfo) => {
        const foundMonth = history.find(currentMonth => {
            return currentMonth.month === monthInfo.month && currentMonth.year === monthInfo.year;
        });

        return foundMonth;
    };

    return { history, historyLoading, postHistory, putHistory, deleteHistory, getMonthHistory };
};

export default useHistory;