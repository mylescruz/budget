import { Table } from "react-bootstrap";
import Link from "next/link";
import monthFormatter from "@/helpers/monthFormatter";
import historySorter from "@/helpers/historySorter";
import { useEffect, useState } from "react";
import centsToDollars from "@/helpers/centsToDollars";

const HistoryTable = ({ history }) => {
  const [historyTotals, setHistoryTotals] = useState({
    budget: 0,
    actual: 0,
    leftover: 0,
  });

  // Get the totals for the budget, actual value spent and the leftover value for all history months
  useEffect(() => {
    if (history) {
      let totalActual = 0;
      let totalBudget = 0;
      let totalLeftover = 0;

      history.forEach((month) => {
        totalBudget += month.budget;
        totalActual += month.actual;
        totalLeftover += month.leftover;
      });

      setHistoryTotals({
        budget: totalBudget,
        actual: totalActual,
        leftover: totalLeftover,
      });
    }
  }, [history]);

  return (
    <Table striped hover>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-4 col-md-3">Month</th>
          <th className="col-4 col-md-3">Budget</th>
          <th className="col-4 col-md-3">Spent</th>
          <th className="d-none d-md-block col-md-3">Remaining</th>
        </tr>
      </thead>
      <tbody>
        {history ? (
          history.length === 0 ? (
            <>
              <tr>
                <td colSpan={4} className="fw-bold text-center">
                  Nothing here yet! Keep tracking your budget every month to see
                  previous history!
                </td>
              </tr>
            </>
          ) : (
            <>
              {historySorter(history).map((month) => (
                <tr key={month.id} className="d-flex">
                  <td className="col-4 col-md-3 click">
                    <Link
                      href={{
                        pathname: "/history/[month]",
                        query: { month: month.month, year: month.year },
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
                    {centsToDollars(month.budget)}
                  </td>
                  <td className="col-4 col-md-3">
                    {centsToDollars(month.actual)}
                  </td>
                  <td
                    className={`d-none d-md-block col-md-3 ${
                      month.leftover < 0 && "text-danger"
                    }`}
                  >
                    {centsToDollars(month.leftover)}
                  </td>
                </tr>
              ))}
            </>
          )
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
            {centsToDollars(historyTotals.budget)}
          </th>
          <th className="col-4 col-md-3">
            {centsToDollars(historyTotals.actual)}
          </th>
          <th
            className={`d-none d-md-block col-md-3 ${
              historyTotals.leftover > 0 ? "text-white" : "text-danger"
            }`}
          >
            {centsToDollars(historyTotals.leftover)}
          </th>
        </tr>
      </tfoot>
    </Table>
  );
};

export default HistoryTable;
