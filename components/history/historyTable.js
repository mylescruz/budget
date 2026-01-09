import { Table } from "react-bootstrap";
import HistoryTableRow from "./historyTableRow";
import dollarFormatter from "@/helpers/dollarFormatter";

const monthColumn = "col-3 col-md-3 col-lg-2 d-flex align-items-center";
const budgetColumn =
  "col-3 col-md-2 d-flex align-items-center justify-content-end";
const spentColumn =
  "col-3 col-md-2 d-flex align-items-center justify-content-end";
const remainingColumn =
  "d-none col-md-2 d-md-flex align-items-center justify-content-end";
const progressColumn = "col-3 col-lg-4";

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
          <th className={monthColumn}>Month</th>
          <th className={budgetColumn}>Budget</th>
          <th className={spentColumn}>Spent</th>
          <th className={remainingColumn}>Remaining</th>
          <th className={progressColumn}>Progress</th>
        </tr>
      </thead>
      <tbody>
        {history.map((month, index) => (
          <HistoryTableRow key={index} month={month} />
        ))}
      </tbody>
      <tfoot>
        <tr className="d-flex table-dark">
          <th className={monthColumn}>Totals</th>
          <th className={budgetColumn}>
            {dollarFormatter(historyTotals.budget)}
          </th>
          <th className={spentColumn}>
            {dollarFormatter(historyTotals.actual)}
          </th>
          <th className={remainingColumn}>
            <span
              className={`${
                historyTotals.leftover > 0 ? "text-white" : "text-danger"
              }`}
            >
              {dollarFormatter(historyTotals.leftover)}
            </span>
          </th>
          <th className={progressColumn}>
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
