import { Table } from "react-bootstrap";
import TransactionRow from "./transactionRow";
import dateSorter from "@/helpers/dateSorter";

const TransactionsTable = ({transactions, putTransaction, removeTransaction, monthInfo}) => {
    transactions = dateSorter(transactions);

    return (
        <Table striped bordered responsive hover className="transactions-table mx-auto">
            <caption>*Click a transaction to view the details</caption>
            <thead className="table-dark">
                <tr>
                    <th className="col-1">Date</th>
                    <th className="col-8">Store</th>
                    <th className="col-2">Category</th>
                    <th className="col-1">Amount</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(transaction => (
                    <TransactionRow key={transaction.id} transaction={transaction} putTransaction={putTransaction} removeTransaction={removeTransaction} monthInfo={monthInfo} />
                ))}
            </tbody>
        </Table>
    );
};

export default TransactionsTable;