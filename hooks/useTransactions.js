import { useEffect, useState } from "react";

const useTransactions = (username, month, year) => {
    const [transactions, setTransactions] = useState([]);

    // GET request that returns the user's transaction based on the username, year and month
    useEffect(() => {
        const getTransactions = async () => {
            try {
                const rsp = await fetch(`/api/transactions/${username}/${year}/${month}`);
                const result = await rsp.json();
                setTransactions(result);
            } catch (err) {
                console.log("Error occured while retrieving transactions: ", err);
            }
        }
        getTransactions();
    }, [username, month, year]);

    // POST request that adds a new transaction based on the username, year and month
    // Then it sets the transactions array to the array returned by the response
    const postTransaction = async (newTransaction) => {
        const date = new Date(newTransaction.date);
        const month = date.toLocaleDateString('en-US', {month: 'long', timeZone: 'UTC'});

        try {
            const rsp = await fetch(`/api/transactions/${username}/${year}/${month}`, {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newTransaction)
            });

            const result = await rsp.json();
            setTransactions(result);
        } catch (err) {
            console.log("Error occurred while adding a transaction: ", err);
        }
    };

    // PUT request that updates a transaction based on the username, year and month
    // Then it sets the transactions array to the array returned by the response
    const putTransaction = async (edittedTransaction) => {
        try {
            const rsp = await fetch(`/api/transactions/${username}/${year}/${month}`, {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(edittedTransaction)
            });

            const result = await rsp.json();
            setTransactions(result);
        } catch (err) {
            console.log("Error occurred while updating a transaction: ", err);
        }
    };

    // DELETE request that deletes a transaction based on the username, year and month
    // Then it sets the transactions array to the array returned by the response
    const deleteTransaction = async (transactionToDelete) => {
        const date = new Date(transactionToDelete.date);
        const month = date.toLocaleDateString('en-US', {month: 'long', timeZone: 'UTC'});

        try {
            const rsp = await fetch(`/api/transactions/${username}/${year}/${month}`, {
                method: "DELETE",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transactionToDelete)
            });

            const result = await rsp.json();
            setTransactions(result);
        } catch (err) {
            console.log("Error occurred while deleting a transaction: ", err);
        }
    };
    
    return { transactions, postTransaction, putTransaction, deleteTransaction };
};

export default useTransactions;