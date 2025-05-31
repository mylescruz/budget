import { Table } from "react-bootstrap";
import PopUp from "@/components/layout/popUp";
import { useContext } from "react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import TransactionsTableRow from "./transactionsTableRow";

const TransactionsTable = ({ monthInfo }) => {
  const { transactions } = useContext(TransactionsContext);
  return (
    <Table striped>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-3 col-md-2 col-lg-1">Date</th>
          <th className="col-6 col-md-5 col-lg-4">
            Store
            <PopUp
              title="Click a transaction to view its details."
              id="transactions-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
          <th className="d-none d-lg-block col-lg-4">Items</th>
          <th className="d-none d-md-block col-md-3 col-lg-2">Category</th>
          <th className="col-3 col-md-2 col-lg-1">Amount</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <TransactionsTableRow
            key={transaction.id}
            transaction={transaction}
            monthInfo={monthInfo}
          />
        ))}
      </tbody>
    </Table>
  );
};

export default TransactionsTable;
