import { useEffect, useRef, useState } from "react";
import { Table } from "react-bootstrap";
import ascendingDateSorter from "@/helpers/ascendingDateSorter";
import descendingDateSorter from "@/helpers/descendingDateSorter";
import styles from "@/styles/income/incomeTable.module.css";
import IncomeTableRow from "./incomeTableRow";
import PopUp from "@/components/layout/popUp";
import dollarFormatter from "@/helpers/dollarFormatter";

const IncomeTable = ({
  income,
  year,
  putIncome,
  deleteIncome,
  incomeTotals,
}) => {
  return (
    <Table striped hover>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-3 col-md-2">Date</th>
          <th className="col-6 col-md-5">
            Source
            <PopUp
              title="Click a source of income to view its details."
              id="source-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
          <th className="d-none d-md-block col-md-3">Type</th>
          <th className="col-3 col-md-2 text-end">Amount</th>
        </tr>
      </thead>
      <tbody>
        {income.map((source) => (
          <IncomeTableRow
            key={source._id}
            source={source}
            putIncome={putIncome}
            deleteIncome={deleteIncome}
            year={year}
          />
        ))}
      </tbody>
      <tfoot>
        <tr className="d-flex">
          <th className="col-3 col-md-2">Total</th>
          <th className="col-6 col-md-5"></th>
          <th className="d-none d-md-block col-md-3"></th>
          <th className="col-3 col-md-2 text-end">
            {dollarFormatter(incomeTotals.amount)}
          </th>
        </tr>
      </tfoot>
    </Table>
  );
};

export default IncomeTable;
