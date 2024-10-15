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
    
    return { transactions, setTransactions };
};

export default useTransactions;