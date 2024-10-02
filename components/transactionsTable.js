import { Table } from "react-bootstrap";
import TransactionRow from "./transactionRow";
import dateSorter from "@/helpers/dateSorter";

const TransactionsTable = ({transactions}) => {
    transactions = dateSorter(transactions);

    return (
        <Table striped bordered responsive="sm" className="mt-4 w-75 mx-auto">
            <thead className="thead-dark">
                <tr>
                <th scope="col">Date</th>
                <th scope="col">Store</th>
                <th scope="col">Category</th>
                <th scope="col">Amount</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(transaction => (
                    <TransactionRow key={transaction.id} transaction={transaction}/>
                ))}
            </tbody>
        </Table>
    );
};

export default TransactionsTable;