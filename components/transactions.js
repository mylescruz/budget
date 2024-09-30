import { useState }  from "react";
import InputTransaction from "./inputTransaction";
import TransactionsTable from "./transactionsTable";
import allTransactions from "@/helpers/allTransactions";
import SummaryTable from "./summaryTable";

const Transactions = () => {
    const [transactions, setTransactions] = useState(allTransactions);

    // useEffect(() => {
    //     axios
    //         .get("/db/transactions.json")
    //         .then((res) => setTransactions(res.data))
    //         .catch((err) => console.log(err));
    // });

    const updateTransactions = (newTransaction) => {
        setTransactions([...transactions, newTransaction]);
    }

    return (
        <>
            <SummaryTable transactions={transactions} />
            <InputTransaction transactions={transactions} updateTransactions={updateTransactions}/>
            <TransactionsTable transactions={transactions}/>
        </>
    );
};

export default Transactions;