import currencyFormatter from "@/helpers/currencyFormatter";
import { useEffect, useMemo, useRef, useState } from "react";
import { Table } from "react-bootstrap";
import IncomeTableRow from "./incomeTableRow";
import PopUp from "../layout/popUp";
import aToZDateSorter from "@/helpers/aToZDateSorter";
import zToADateSorter from "@/helpers/ztoADateSorter";
import styles from "@/styles/income/incomeTable.module.css";

const IncomeTable = ({
  income,
  putIncome,
  deleteIncome,
  yearInfo,
  getMonthIncome,
}) => {
  const [sortedIncome, setSortedIncome] = useState(aToZDateSorter(income));
  const [sortDirection, setSortDirection] = useState(true);
  const sortAscending = useRef(true);

  // Sort income from first to last or opposite on user click
  useEffect(() => {
    if (income) {
      setSortedIncome(aToZDateSorter(income));
    }
  }, [income]);

  // Sets the table's total gross income, taxes and net income
  const footerValues = useMemo(() => {
    let totalGross = 0;
    let totalTaxes = 0;
    let totalNet = 0;

    if (income) {
      income.forEach((paycheck) => {
        totalGross += paycheck.gross;
        totalTaxes += paycheck.taxes;
      });

      totalNet = totalGross - totalTaxes;
    }

    return {
      totalGross: totalGross,
      totalTaxes: totalTaxes,
      totalNet: totalNet,
    };
  }, [income]);

  const sortIncomeDates = () => {
    sortAscending.current = !sortAscending.current;

    if (sortAscending.current) {
      setSortedIncome(aToZDateSorter(income));
    } else {
      setSortedIncome(zToADateSorter(income));
    }

    setSortDirection(sortAscending.current);
  };

  return (
    <Table striped hover>
      <thead className="table-dark">
        <tr className="d-flex">
          <th
            className={`col-3 col-md-2 col-lg-1 ${styles.dateSorter}`}
            onClick={sortIncomeDates}
          >
            Date
            {sortDirection ? <span> &#8595;</span> : <span> &#8593;</span>}
          </th>
          <th className="col-6 col-md-4 col-lg-3">
            Company
            <PopUp
              title="Click a paycheck to view its details."
              id="income-info"
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
      {income ? (
        <>
          <tbody>
            {sortedIncome.map((paycheck) => (
              <IncomeTableRow
                key={paycheck.id}
                paycheck={paycheck}
                putIncome={putIncome}
                deleteIncome={deleteIncome}
                yearInfo={yearInfo}
                getMonthIncome={getMonthIncome}
              />
            ))}
          </tbody>
          <tfoot>
            <tr className="d-flex">
              <th className="col-3 col-md-2">Total</th>
              <th className="col-6 col-md-4"></th>
              <th className="d-none d-md-block col-md-2">
                {currencyFormatter.format(footerValues.totalGross)}
              </th>
              <th className="d-none d-md-block col-md-2">
                {currencyFormatter.format(footerValues.totalTaxes)}
              </th>
              <th className="col-3 col-md-2">
                {currencyFormatter.format(footerValues.totalNet)}
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

export default IncomeTable;
