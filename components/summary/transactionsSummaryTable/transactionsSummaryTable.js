import { Table } from "react-bootstrap";
import TransactionsSummaryTableRow from "./transactionsSummaryTableRow";

const dateColumn = "col-3 col-md-2 col-lg-1";
const storeColumn = "col-6 col-md-6 col-lg-3";
const itemsColumn = "d-none d-lg-block col-lg-4";
const categoryColumn = "d-none d-md-block col-md-2";
const amountColumn = "col-3 col-md-2 text-end";

const TransactionsSummaryTable = ({ sortedTransactions }) => {
  return (
    <Table striped hover>
      <thead>
        <tr className="table-dark d-flex">
          <th className={dateColumn}>Date</th>
          <th className={storeColumn}>Store</th>
          <th className={itemsColumn}>Items</th>
          <th className={categoryColumn}>Category</th>
          <th className={amountColumn}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {sortedTransactions.length === 0 ? (
          <tr>
            <td colSpan={1} className="text-center fw-bold">
              There are no transactions that match these filters
            </td>
          </tr>
        ) : (
          sortedTransactions.map((transaction) => (
            <TransactionsSummaryTableRow
              key={transaction._id}
              transaction={transaction}
            />
          ))
        )}
      </tbody>
    </Table>
  );
};

export default TransactionsSummaryTable;
