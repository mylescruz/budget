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

    const postTransactions = async (transaction) => {
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

    const updateTransactions = (transaction) => {
        postTransactions(transaction);
        setTransactions([...transactions, transaction]);
    };
    
    return { transactions, setTransactions, updateTransactions };
};

export default useTransactions;