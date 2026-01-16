import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Table } from "react-bootstrap";

const dateColumn = "col-3 col-md-2";
const storeColumn = "col-6 col-md-5";
const categoryColumn = "d-none d-md-block col-md-3";
const amountColumn = "col-3 col-md-2 text-end";

const TransactionsSummaryTable = ({ sortedTransactions }) => {
  return (
    <>
      <Table>
        <thead>
          <tr className="table-dark d-flex">
            <th className={dateColumn}>Date</th>
            <th className={storeColumn}>Store</th>
            <th className={categoryColumn}>Category</th>
            <th className={amountColumn}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((transaction) => (
            <tr key={transaction._id} className="d-flex">
              <td className={dateColumn}>{dateFormatter(transaction.date)}</td>
              <td className={storeColumn}>{transaction.store}</td>
              <td className={categoryColumn}>{transaction.category}</td>
              <td className={amountColumn}>
                {dollarFormatter(transaction.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default TransactionsSummaryTable;
