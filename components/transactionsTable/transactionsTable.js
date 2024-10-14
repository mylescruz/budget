import { Table } from "react-bootstrap";
import TransactionRow from "./transactionRow";
import dateSorter from "@/helpers/dateSorter";

const TransactionsTable = ({transactions, categories, setCategories, editOldTransaction, removeTransaction}) => {
    transactions = dateSorter(transactions);

    return (
        <Table striped bordered responsive hover className="mt-4 w-75 mx-auto">
            <caption>*Click a transaction to view the details</caption>
            <thead className="table-dark">
                <tr>
                    <th className="col-1">Date</th>
                    <th>Store</th>
                    <th className="col-2">Category</th>
                    <th className="col-1">Amount</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(transaction => (
                    <TransactionRow key={transaction.id} transaction={transaction} categories={categories} setCategories={setCategories} editOldTransaction={editOldTransaction} removeTransaction={removeTransaction} />
                ))}
            </tbody>
        </Table>
    );
};

export default TransactionsTable;