import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Table } from "react-bootstrap";

const dateColumn = "col-3 col-md-2 col-lg-1";
const storeColumn = "col-6 col-md-5 col-lg-3";
const itemsColumn = "d-none d-lg-block col-lg-4";
const categoryColumn = "d-none d-md-block col-md-2";
const amountColumn = "col-3 col-md-2 text-end";

const TransactionsSummaryTable = ({ sortedTransactions }) => {
  return (
    <>
      <Table>
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
              <tr key={transaction._id} className="d-flex">
                <td className={dateColumn}>
                  {dateFormatter(transaction.date)}
                </td>
                <td className={storeColumn}>
                  {transaction.store.length > 25
                    ? transaction.store.slice(0, 25) + "..."
                    : transaction.store}
                </td>
                <td className={itemsColumn}>
                  {transaction.items.length > 30
                    ? transaction.items.slice(0, 30) + "..."
                    : transaction.items}
                </td>
                <td className={categoryColumn}>{transaction.category}</td>
                <td className={amountColumn}>
                  {dollarFormatter(transaction.amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
};

export default TransactionsSummaryTable;
