import { Table } from "react-bootstrap";
import TransactionRow from "./transactionRow";
import PopUp from "@/components/layout/popUp";

const TransactionsTable = ({transactions, putTransaction, deleteTransaction, monthInfo}) => {
    return (
        <Table striped>
            <thead className="table-dark">
                <tr className="d-flex">
                    <th className="col-3 col-md-2 col-lg-1">Date</th>
                    <th className="col-6 col-md-5 col-lg-4">
                        Store
                        <PopUp title="Click a transaction to view its details." id="transactions-info">
                            <span> &#9432;</span>
                        </PopUp>
                    </th>
                    <th className="d-none d-lg-block col-lg-4">Items</th>
                    <th className="d-none d-md-block col-md-3 col-lg-2">Category</th>
                    <th className="col-3 col-md-2 col-lg-1">Amount</th>
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