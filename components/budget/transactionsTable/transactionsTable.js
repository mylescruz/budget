import { Table } from "react-bootstrap";
import TransactionRow from "./transactionRow";
import PopUp from "@/components/layout/popUp";

const TransactionsTable = ({transactions, putTransaction, deleteTransaction, monthInfo}) => {
    return (
        <Table striped bordered responsive hover className="transactions-table mx-auto">
            <thead className="table-dark">
                <tr className="d-flex">
                    <th className="col-2">Date</th>
                    <th className="col-7 col-sm-4">
                        Store
                        <PopUp title="Click a transaction to view its details." id="transactions-info">
                            <span> &#9432;</span>
                        </PopUp>
                    </th>
                    <th className="d-none d-sm-block col-sm-3">Category</th>
                    <th className="col-3 col-sm-3">Amount</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(transaction => (
                    <TransactionRow key={transaction.id} transaction={transaction} putTransaction={putTransaction} deleteTransaction={deleteTransaction} monthInfo={monthInfo} />
                ))}
            </tbody>
        </Table>
    );
};

export default TransactionsTable;