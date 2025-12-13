import { Table } from "react-bootstrap";
import currencyFormatter from "@/helpers/currencyFormatter";
import HistoryTableRow from "./historyTableRow";

const HistoryTable = ({ history, historyTotals }) => {
  let statusBarLength;
  let budgetBarLength;
  let percent;

  if (history) {
    statusBarLength = Math.round(
      (historyTotals.actual * 12) / historyTotals.budget
    );

    if (historyTotals.actual < historyTotals.budget && statusBarLength === 12) {
      statusBarLength = 11;
    }

    if (statusBarLength > 12) {
      statusBarLength = 12;
    }

    if (historyTotals.actual > 0 && statusBarLength <= 0) {
      statusBarLength = 12;
    }

    budgetBarLength = 12 - statusBarLength;

    percent = Math.round((historyTotals.actual / historyTotals.budget) * 100);

    if (
      historyTotals.actual > historyTotals.budget &&
      historyTotals.budget < 0
    ) {
      percent = Math.round(
        ((historyTotals.actual + historyTotals.budget * -1) /
          -historyTotals.budget) *
          100
      );
    }
  }

  return (
    <Table striped hover>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-3 col-md-3">Month</th>
          <th className="col-3 col-md-2">Budget</th>
          <th className="col-3 col-md-2">Spent</th>
          <th className="d-none d-md-block col-md-2">Remaining</th>
          <th className="col-3 col-md-3">Progress</th>
        </tr>
      </thead>
      <tbody>
        {history.map((month, index) => (
          <HistoryTableRow key={index} month={month} />
        ))}
      </tbody>
      <tfoot>
        <tr className="d-flex table-dark">
          <th className="col-3 col-md-3 d-flex align-items-center">Totals</th>
          <th className="col-3 col-md-2 d-flex align-items-center">
            {currencyFormatter.format(historyTotals.budget)}
          </th>
          <th className="col-3 col-md-2 d-flex align-items-center">
            {currencyFormatter.format(historyTotals.actual)}
          </th>
          <th className="d-none col-md-2 d-md-flex align-items-center">
            <span
              className={`${
                historyTotals.leftover > 0 ? "text-white" : "text-danger"
              }`}
            >
              {currencyFormatter.format(historyTotals.leftover)}
            </span>
          </th>
          <th className="col-3 col-md-3">
            {history.length > 0 && (
              <div className="d-flex flex-row align-items-center text-white text-end">
                {statusBarLength === 12 && (
                  <div
                    className={`${
                      historyTotals.actual > historyTotals.budget
                        ? "bg-danger"
                        : "bg-warning"
                    } col-${statusBarLength} rounded py-1 px-2 status-bar text-center`}
                  >
                    {percent}%
                  </div>
                )}
                {budgetBarLength === 12 && (
                  <div
                    className={`bg-dark col-${budgetBarLength} rounded py-1 px-2 status-bar text-center ${
                      historyTotals.budget < 0 && "text-danger"
                    }`}
                  >
                    {percent}%
                  </div>
                )}
                {statusBarLength !== 0 && budgetBarLength !== 0 && (
                  <>
                    <div
                      className={`${statusBarLength < 8 && "bg-success"}
                  ${
                    statusBarLength >= 8 &&
                    statusBarLength <= 11 &&
                    "bg-warning"
                  }
                  ${
                    (statusBarLength === 12 ||
                      historyTotals.actual > historyTotals.budget) &&
                    "bg-danger"
                  }
                  col-${statusBarLength} border rounded-start py-1 px-2 status-bar text-center`}
                    >
                      {percent}%
                    </div>
                    <div
                      className={`bg-dark col-${budgetBarLength} border rounded-end status-bar`}
                    />
                  </>
                )}
              </div>
            )}
          </th>
        </tr>
      </tfoot>
    </Table>
  );
};

export default HistoryTable;
