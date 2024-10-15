import { useEffect, useState } from "react";

const useTransactions = (month) => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const getTransactions = async () => {
            try {
                const rsp = await fetch(`/api/transactions/${month}`);
                const result = await rsp.json();
                setTransactions(result);
            } catch (err) {
                console.log("Error occured while retrieving transactions: ", err);
            }
        }
        getTransactions();
    }, [month]);

    const postTransaction = async (transaction) => {
        const date = new Date(transaction.date);
        const month = date.toLocaleDateString('en-US', {month: 'long'});

        try {
            await fetch(`/api/transactions/${month}`, {
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

    const putTransaction = async (edittedTransaction) => {
        const date = new Date(edittedTransaction.date);
        const month = date.toLocaleDateString('en-US', {month: 'long'});

        try {
            await fetch(`/api/transactions/${month}`, {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(edittedTransaction)
            });
        } catch (err) {
            console.log("Error occurred while updating transactions: ", err);
        }
    };

    const addNewTransaction = (transaction) => {
        postTransaction(transaction);
        setTransactions([...transactions, transaction]);
    };

    const updateTransaction = (edittedTransaction) => {
        putTransaction(edittedTransaction);

        const updatedTransactions = transactions.map(transaction => {
            if (transaction.id === edittedTransaction.id)
                return edittedTransaction;
            else
                return transaction;
        });
        setTransactions(updatedTransactions);
    };
    
    return { transactions, setTransactions, addNewTransaction, updateTransaction };
};

export default useTransactions;