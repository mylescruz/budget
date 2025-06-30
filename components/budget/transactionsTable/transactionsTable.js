import { Table } from "react-bootstrap";
import PopUp from "@/components/layout/popUp";
import { useContext, useEffect, useRef, useState } from "react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import TransactionsTableRow from "./transactionsTableRow";
import aToZDateSorter from "@/helpers/aToZDateSorter";
import zToADateSorter from "@/helpers/ztoADateSorter";
import styles from "@/styles/budget/transactionsTable/transactionsTable.module.css";

const TransactionsTable = ({ monthInfo }) => {
  const { transactions } = useContext(TransactionsContext);

  const [sortedTransactions, setSortedTransactions] = useState(
    aToZDateSorter(transactions)
  );
  const [sortDirection, setSortDirection] = useState(true);
  const sortAscending = useRef(true);

  // Sort transactions from first to last or opposite on user click
  useEffect(() => {
    if (transactions) {
      setSortedTransactions(aToZDateSorter(transactions));
    }
  }, [transactions]);

  const sortTransactionDates = () => {
    sortAscending.current = !sortAscending.current;

    if (sortAscending.current) {
      setSortedTransactions(aToZDateSorter(transactions));
    } else {
      setSortedTransactions(zToADateSorter(transactions));
    }

    setSortDirection(sortAscending.current);
  };

  return (
    <Table striped>
      <thead className="table-dark">
        <tr className="d-flex">
          <th
            className={`col-3 col-md-2 col-lg-1 ${styles.dateSorter}`}
            onClick={sortTransactionDates}
          >
            Date
            {sortDirection ? <span> &#8595;</span> : <span> &#8593;</span>}
          </th>
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
        {transactions ? (
          sortedTransactions.map((transaction) => (
            <TransactionsTableRow
              key={transaction.id}
              transaction={transaction}
              monthInfo={monthInfo}
            />
          ))
        ) : (
          <tr>
            <td colSpan={1} className="text-danger fw-bold text-center">
              &#9432; There was an error loading your transactions. Please try
              again later!
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default TransactionsTable;
