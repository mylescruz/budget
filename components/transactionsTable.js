import { Table } from "react-bootstrap";
import TransactionRow from "./transactionRow";
import dateSorter from "@/helpers/dateSorter";
import styles from "@/styles/transactionTable.module.css";

const TransactionsTable = ({transactions}) => {
    transactions = dateSorter(transactions);

    return (
        <>
            <div className={styles.tableContainer}>
                <Table striped bordered className="mt-4 w-50">
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
                            <TransactionRow key={transaction.id} transaction={transaction}/>
                        ))}
                    </tbody>
                </Table>
            </div>
        </>
    );
};

export default TransactionsTable;