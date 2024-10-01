import allTransactions from "@/helpers/allTransactions";
import InputTransaction from "./inputTransaction";
import SummaryTable from "./summaryTable";
import TransactionsTable from "./transactionsTable";
import { useEffect, useState } from "react";


const Month = () => {
    const [transactions, setTransactions] = useState(allTransactions);

    const updateTransactions = (newTransaction) => {
        setTransactions([...transactions, newTransaction]);
    };

    return (
        <>
            <SummaryTable transactions={transactions} />
            <InputTransaction transactions={transactions} updateTransactions={updateTransactions}/>
            <TransactionsTable transactions={transactions}/>
        </>
    );
};

export default Month;