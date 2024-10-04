import { Table } from "react-bootstrap";
import TransactionRow from "./transactionRow";
import dateSorter from "@/helpers/dateSorter";

const TransactionsTable = ({transactions, categories, updateTransactions, removeTransaction}) => {
    transactions = dateSorter(transactions);

    return (
        <Table striped bordered responsive hover className="mt-4 w-75 mx-auto">
            <thead className="table-dark">
                <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Store</th>
                    <th scope="col">Category</th>
                    <th scope="col">Amount</th  >
                </tr>
            </thead>
            <tbody>
                {transactions.map(transaction => (
                    <TransactionRow key={transaction.id} transaction={transaction} categories={categories} updateTransactions={updateTransactions} removeTransaction={removeTransaction} />
                ))}
            </tbody>
        </Table>
    );
};

export default TransactionsTable;