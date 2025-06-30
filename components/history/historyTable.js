import { Table } from "react-bootstrap";
import currencyFormatter from "@/helpers/currencyFormatter";
import Link from "next/link";
import monthFormatter from "@/helpers/monthFormatter";
import PopUp from "../layout/popUp";
import historySorter from "@/helpers/historySorter";
import { useEffect, useState } from "react";

const HistoryTable = ({ history }) => {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalActual, setTotalActual] = useState(0);
  const [totalLeftover, setTotalLeftover] = useState(0);

  useEffect(() => {
    if (history) {
      let totalActual = 0;
      let totalBudget = 0;
      let totalLeftover = 0;

      history.forEach((month) => {
        totalBudget += parseFloat(month.budget);
        totalActual += parseFloat(month.actual);
        totalLeftover += parseFloat(month.leftover);
      });

      setTotalBudget(totalBudget);
      setTotalActual(totalActual);
      setTotalLeftover(totalLeftover);
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
          <th className="d-none d-md-block col-md-3">Budget</th>
          <th className="col-4 col-md-3">Spent</th>
          <th className="col-4 col-md-3">Remaining</th>
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
                      query: { month: month.month, year: month.year },
                    }}
                  >
                    <>
                      <span className="d-sm-none">
                        {monthFormatter(`${month.month} 01, ${month.year}`)}
                      </span>
                      <span className="d-none d-sm-block">
                        {month.month} {month.year}
                      </span>
                    </>
                  </Link>
                </td>
                <td className="d-none d-md-block col-md-3">
                  {currencyFormatter.format(month.budget)}
                </td>
                <td className="col-4 col-md-3">
                  {currencyFormatter.format(month.actual)}
                </td>
                <td
                  className={`col-4 col-md-3 ${month.leftover < 0 && "text-danger"}`}
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
          <th className="d-none d-md-block col-md-3">
            {currencyFormatter.format(totalBudget)}
          </th>
          <th className="col-4 col-md-3">
            {currencyFormatter.format(totalActual)}
          </th>
          <th
            className={`col-4 col-md-3 ${totalLeftover > 0 ? "text-white" : "text-danger"}`}
          >
            {currencyFormatter.format(totalLeftover)}
          </th>
        </tr>
      </tfoot>
    </Table>
  );
};

export default HistoryTable;
