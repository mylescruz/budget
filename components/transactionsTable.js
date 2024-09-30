import transactions from "@/helpers/transactions";
import { Table } from "react-bootstrap";
import TransactionRow from "./transactionRow";

const TransactionsTable = () => {
    return (
        <Table striped bordered className="mt-4">
            <thead className="thead-dark">
                <tr>
                <th scope="col">Date</th>
                <th scope="col">Store</th>
                <th scope="col">Item(s) Purchased</th>
                <th scope="col">Category</th>
                <th scope="col">Amount</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(transaction => (
                    <TransactionRow key={transaction.date} transaction={transaction}/>
                ))}
            </tbody>
        </Table>
    );
};

export default TransactionsTable;