import categorySorter from "@/helpers/categorySorter";
import { Table } from "react-bootstrap";
import SummaryTableRow from "./summaryTableRow";
import PopUp from "../layout/popUp";
import { useEffect, useState } from "react";
import currencyFormatter from "@/helpers/currencyFormatter";

const SummaryTable = ({ summary }) => {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalActual, setTotalActual] = useState(0);

  useEffect(() => {
    if (summary) {
      let totalActual = 0;
      let totalBudget = 0;

      summary.forEach((category) => {
        totalBudget += parseFloat(category.budget);
        totalActual += parseFloat(category.actual);
      });

      setTotalBudget(totalBudget);
      setTotalActual(totalActual);
    }
  }, [summary]);

  return (
    <Table striped>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-6">Category</th>
          <th className="col-3 col-md-2">Budget</th>
          <th className="col-3 col-md-2">Actual</th>
          <th className="d-none d-md-block col-md-2 cell">Remaining</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th className="bg-secondary text-white clicker" colSpan={1}>
            Fixed Expenses
            <PopUp
              title="Your expenses that remain the same each month."
              id="fixed-expenses-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
        </tr>
        {categorySorter(summary).map(
          (category) =>
            category.fixed && (
              <SummaryTableRow key={category.id} category={category} />
            )
        )}
        <tr>
          <th className="bg-secondary text-white clicker" colSpan={1}>
            Changing Expenses
            <PopUp
              title="Your expenses that change depending on your spending."
              id="variable-expenses-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
        </tr>
        {categorySorter(summary).map(
          (category) =>
            !category.fixed && (
              <SummaryTableRow key={category.id} category={category} />
            )
        )}
      </tbody>
      <tfoot className="table-dark">
        <tr className="d-flex">
          <th className="col-6">Totals</th>
          <th className="col-3 col-md-2 cell">
            {currencyFormatter.format(totalBudget)}
          </th>
          <th className="col-3 col-md-2 cell">
            {currencyFormatter.format(totalActual)}
          </th>
          <th
            className={`d-none d-md-block col-md-2 cell ${totalBudget - totalActual > 0 ? "text-white" : "text-danger"}`}
          >
            {currencyFormatter.format(totalBudget - totalActual)}
          </th>
        </tr>
      </tfoot>
    </Table>
  );
};

export default SummaryTable;
