import { Table } from "react-bootstrap";
import PopUp from "@/components/layout/popUp";
import TransactionsTableRow from "./transactionsTableRow";

const TransactionsTable = ({ sortedTransactions, dateInfo }) => {
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
        {sortedTransactions.length === 0 ? (
          <tr>
            <td colSpan={1} className="text-center fw-bold">
              There is no transactions that match these filters
            </td>
          </tr>
        ) : (
          sortedTransactions.map((transaction) => (
            <TransactionsTableRow
              key={transaction._id}
              transaction={transaction}
              dateInfo={dateInfo}
            />
          ))
        )}
      </tbody>
    </Table>
  );
};

export default TransactionsTable;
