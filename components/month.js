import axios from "axios";
import InputTransaction from "./inputTransaction";
import SummaryTable from "./summaryTable";
import TransactionsTable from "./transactionsTable";
import { useEffect, useState } from "react";


const Month = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axios
        .get("/db/categories.json")
        .then((res) => {
            // console.log(res.data.categories);
            setCategories(res.data.categories);
        })
        .catch((err) => console.log(err));
    });

    const updateTransactions = (newTransaction) => {
        setTransactions([...transactions, newTransaction]);
    };

    return (
        <>
            <SummaryTable transactions={transactions} categories={categories} />
            <TransactionsTable transactions={transactions}/>
            <InputTransaction transactions={transactions} updateTransactions={updateTransactions} categories={categories}/>
        </>
    );
};

export default Month;