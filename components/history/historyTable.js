import { Table } from "react-bootstrap";
import HistoryTableRow from "./historyTableRow";
import dollarFormatter from "@/helpers/dollarFormatter";
import ProgressBar from "../layout/progressBar";

const monthColumn = "col-3 col-md-3 col-lg-2 d-flex align-items-center";
const budgetColumn =
  "col-3 col-md-2 d-flex align-items-center justify-content-end";
const spentColumn =
  "col-3 col-md-2 d-flex align-items-center justify-content-end";
const remainingColumn =
  "d-none col-md-2 d-md-flex align-items-center justify-content-end";
const progressColumn = "col-3 col-lg-4";

const HistoryTable = ({ history, historyTotals }) => {
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
              <ProgressBar
                actualValue={historyTotals.actual}
                budgetValue={historyTotals.budget}
                fixedCategory={false}
              />
            )}
          </th>
        </tr>
      </tfoot>
    </Table>
  );
};

export default HistoryTable;
