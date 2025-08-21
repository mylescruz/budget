import { Table } from "react-bootstrap";
import currencyFormatter from "@/helpers/currencyFormatter";
import Link from "next/link";
import monthFormatter from "@/helpers/monthFormatter";
import PopUp from "../layout/popUp";
import historySorter from "@/helpers/historySorter";
import { useEffect, useState } from "react";

const HistoryTable = ({ history }) => {
  const [historyTotals, setHistoryTotals] = useState({
    budget: 0,
    actual: 0,
    remaining: 0,
  });

  // Get the totals for the budget, actual value spent and the remaining value for all history months
  useEffect(() => {
    if (history) {
      let totalActual = 0;
      let totalBudget = 0;
      let totalRemaining = 0;

      history.forEach((month) => {
        totalBudget += parseFloat(month.budget);
        totalActual += parseFloat(month.actual);
        totalRemaining += parseFloat(month.leftover);
      });

      setHistoryTotals({
        budget: totalBudget,
        actual: totalActual,
        remaining: totalRemaining,
      });
    }
  }, [history]);

  return (
    <Table striped hover>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-4 col-md-3">
            Month
            <PopUp
              title="Click a month to view its full budget."
              id="history-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
          <th className="col-4 col-md-3">Budget</th>
          <th className="col-4 col-md-3">Spent</th>
          <th className="d-none d-md-block col-md-3">Remaining</th>
        </tr>
      </thead>
      <tbody>
        {history ? (
          <>
            {historySorter(history).map((month) => (
              <tr key={month.id} className="d-flex">
                <td className="col-4 col-md-3 click">
                  <Link
                    href={{
                      pathname: "/history/[month]",
                      query: { month: month.monthName, year: month.year },
                    }}
                  >
                    <>
                      <span className="d-sm-none">
                        {monthFormatter(`${month.month}/01/${month.year}`)}
                      </span>
                      <span className="d-none d-sm-block">
                        {month.monthName} {month.year}
                      </span>
                    </>
                  </Link>
                </td>
                <td className="col-4 col-md-3">
                  {currencyFormatter.format(month.budget)}
                </td>
                <td className="col-4 col-md-3">
                  {currencyFormatter.format(month.actual)}
                </td>
                <td
                  className={`d-none d-md-block col-md-3 ${
                    month.leftover < 0 && "text-danger"
                  }`}
                >
                  {currencyFormatter.format(month.leftover)}
                </td>
              </tr>
            ))}
          </>
        ) : (
          <tr>
            <td colSpan={4} className="text-danger fw-bold text-center">
              &#9432; There was an error loading your history. Please try again
              later!
            </td>
          </tr>
        )}
      </tbody>
      <tfoot>
        <tr className="d-flex table-dark">
          <th className="col-4 col-md-3">Totals</th>
          <th className="col-4 col-md-3">
            {currencyFormatter.format(historyTotals.budget)}
          </th>
          <th className="col-4 col-md-3">
            {currencyFormatter.format(historyTotals.actual)}
          </th>
          <th
            className={`d-none d-md-block col-md-3 ${
              historyTotals.remaining > 0 ? "text-white" : "text-danger"
            }`}
          >
            {currencyFormatter.format(historyTotals.remaining)}
          </th>
        </tr>
      </tfoot>
    </Table>
  );
};

export default HistoryTable;
