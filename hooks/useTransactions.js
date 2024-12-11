import { useEffect, useState } from "react";

const useTransactions = (month, year) => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const getTransactions = async () => {
            try {
                const rsp = await fetch(`/api/transactions/${year}/${month}`);
                const result = await rsp.json();
                setTransactions(result);
            } catch (err) {
                console.log("Error occured while retrieving transactions: ", err);
            }
        }
        getTransactions();
    }, [month, year]);

    const postTransaction = async (transaction) => {
        const date = new Date(transaction.date);
        const month = date.toLocaleDateString('en-US', {month: 'long', timeZone: 'UTC'});

        try {
            await fetch(`/api/transactions/${year}/${month}`, {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transaction)
            });
        } catch (err) {
            console.log("Error occurred while updating transactions: ", err);
        }
    };

    const putTransaction = async (updatedTransactions) => {
        try {
            await fetch(`/api/transactions/${year}/${month}`, {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedTransactions)
            });
        } catch (err) {
            console.log("Error occurred while updating transactions: ", err);
        }
    };

    const deleteTransaction = async (transaction) => {
        const date = new Date(transaction.date);
        const month = date.toLocaleDateString('en-US', {month: 'long', timeZone: 'UTC'});

        try {
            await fetch(`/api/transactions/${year}/${month}`, {
                method: "DELETE",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transaction)
            });
        } catch (err) {
            console.log("Error occurred while deleting transaction: ", err);
        }
    };

    const addNewTransaction = (transaction) => {
        postTransaction(transaction);
        setTransactions([...transactions, transaction]);
    };

    const updateTransaction = (edittedTransaction) => {
        const updatedTransactions = transactions.map(transaction => {
            if (transaction.id === edittedTransaction.id)
                return edittedTransaction;
            else
                return transaction;
        });

        putTransaction(updatedTransactions);
        setTransactions(updatedTransactions);
    };

    const deleteFromTransactions = (transactionToDelete) => {
        deleteTransaction(transactionToDelete);

        const updatedTransactions = transactions.filter(transaction => {
            return transaction.id !== transactionToDelete.id;
        });
        setTransactions(updatedTransactions);
    };
    
    return { transactions, addNewTransaction, updateTransaction, deleteFromTransactions };
};

export default useTransactions;