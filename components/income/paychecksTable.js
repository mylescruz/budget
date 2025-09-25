import { useContext, useEffect, useRef, useState } from "react";
import { Table } from "react-bootstrap";
import PaychecksTableRow from "./paychecksTableRow";
import PopUp from "../layout/popUp";
import aToZDateSorter from "@/helpers/aToZDateSorter";
import zToADateSorter from "@/helpers/ztoADateSorter";
import styles from "@/styles/income/paychecksTable.module.css";
import { PaychecksContext } from "@/contexts/PaychecksContext";
import centsToDollars from "@/helpers/centsToDollars";

const PaychecksTable = ({ yearInfo }) => {
  const { paychecks } = useContext(PaychecksContext);

  const [sortedPaychecks, setSortedPaychecks] = useState(paychecks);
  const [paychecksTotals, setPaychecksTotals] = useState({
    totalGross: 0,
    totalTaxes: 0,
    totalNet: 0,
  });
  const [sortDirection, setSortDirection] = useState(true);

  const sortAscending = useRef(true);

  // Sort paychecks from first to last or opposite on user click
  useEffect(() => {
    if (paychecks) {
      setSortedPaychecks(aToZDateSorter(paychecks));
    }
  }, [paychecks]);

  // Sets a user's total gross paychecks, taxes and net paychecks
  useEffect(() => {
    if (paychecks) {
      let grossTotal = 0;
      let taxesTotal = 0;

      if (paychecks) {
        paychecks.forEach((paycheck) => {
          grossTotal += paycheck.gross;
          taxesTotal += paycheck.taxes;
        });

        setPaychecksTotals({
          totalGross: grossTotal,
          totalTaxes: taxesTotal,
          totalNet: grossTotal - taxesTotal,
        });
      }
    }
  }, [paychecks]);

  const sortPaycheckDates = () => {
    sortAscending.current = !sortAscending.current;

    if (sortAscending.current) {
      setSortedPaychecks(aToZDateSorter(paychecks));
    } else {
      setSortedPaychecks(zToADateSorter(paychecks));
    }

    setSortDirection(sortAscending.current);
  };

  return (
    <Table striped hover>
      <thead className="table-dark">
        <tr className="d-flex">
          <th
            className={`col-3 col-md-2 col-lg-1 ${styles.dateSorter}`}
            onClick={sortPaycheckDates}
          >
            Date
            {sortDirection ? <span> &#8595;</span> : <span> &#8593;</span>}
          </th>
          <th className="col-6 col-md-4 col-lg-3">
            Company
            <PopUp
              title="Click a paycheck to view its details."
              id="paychecks-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
          <th className="d-none d-lg-block col-lg-2">Description</th>
          <th className="d-none d-md-block col-md-2 col-lg-2">Gross Pay</th>
          <th className="d-none d-md-block col-md-2 col-lg-2">Taxes</th>
          <th className="col-3 col-md-2 col-lg-2">Net Pay</th>
        </tr>
      </thead>
      {paychecks ? (
        <>
          <tbody>
            {sortedPaychecks.map((paycheck) => (
              <PaychecksTableRow
                key={paycheck.id}
                paycheck={paycheck}
                yearInfo={yearInfo}
              />
            ))}
          </tbody>
          <tfoot>
            <tr className="d-flex">
              <th className="col-3 col-md-2">Total</th>
              <th className="col-6 col-md-4"></th>
              <th className="d-none d-md-block col-md-2">
                {centsToDollars(paychecksTotals.totalGross)}
              </th>
              <th className="d-none d-md-block col-md-2">
                {centsToDollars(paychecksTotals.totalTaxes)}
              </th>
              <th className="col-3 col-md-2">
                {centsToDollars(paychecksTotals.totalNet)}
              </th>
            </tr>
          </tfoot>
        </>
      ) : (
        <tbody>
          <tr>
            <td colSpan={4} className="text-danger fw-bold text-center">
              &#9432; There was an error loading your paychecks. Please try
              again later!
            </td>
          </tr>
        </tbody>
      )}
    </Table>
  );
};

export default PaychecksTable;
