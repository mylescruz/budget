import dollarFormatter from "@/helpers/dollarFormatter";
import monthFormatter from "@/helpers/monthFormatter";
import { useRouter } from "next/router";

const monthColumn =
  "col-3 col-md-3 col-lg-2 d-flex align-items-center click fw-bold";
const budgetColumn =
  "col-3 col-md-2 d-flex align-items-center justify-content-end";
const spentColumn =
  "col-3 col-md-2 d-flex align-items-center justify-content-end";
const remainingColumn =
  "d-none col-md-2 d-md-flex align-items-center justify-content-end";
const progressColumn = "col-3 col-lg-4";

const SUCCESS_VALUE = 10;
const WARNING_VALUE = 11;
const DANGER_VALUE = 12;

const HistoryTableRow = ({ month }) => {
  const router = useRouter();

  let statusBarLength = Math.round((month.actual * 12) / month.budget);

  if (month.actual < month.budget && statusBarLength === 12) {
    statusBarLength = 11;
  }

  if (statusBarLength > 12) {
    statusBarLength = 12;
  }

  if (month.actual > 0 && statusBarLength <= 0) {
    statusBarLength = 12;
  }

  const budgetBarLength = 12 - statusBarLength;

  let percent = Math.round((month.actual / month.budget) * 100);

  if (month.actual > month.budget && month.budget < 0) {
    percent = Math.round(
      ((month.actual + month.budget * -1) / -month.budget) * 100
    );
  }

  return (
    <tr
      className="d-flex clicker"
      onClick={() => router.push(`/history/${month.month}?year=${month.year}`)}
    >
      <td className={monthColumn}>
        <span className="d-sm-none">
          {monthFormatter(`${month.month}/01/${month.year}`, "2-digit")}
        </span>
        <span className="d-none d-sm-block">
          {monthFormatter(`${month.month}/01/${month.year}`, "long")}
        </span>
      </td>
      <td className={budgetColumn}>
        <span className="fw-bold">{dollarFormatter(month.budget)}</span>
      </td>
      <td className={spentColumn}>{dollarFormatter(month.actual)}</td>
      <td className={remainingColumn}>
        <span className={`${month.leftover < 0 && "text-danger fw-bold"}`}>
          {dollarFormatter(month.leftover)}
        </span>
      </td>
      <td className={progressColumn}>
        <div className="d-flex flex-row align-items-center text-white text-end">
          {statusBarLength === DANGER_VALUE && (
            <div
              className={`${
                month.actual > month.budget ? "bg-danger" : "bg-warning"
              } col-${statusBarLength} rounded py-1 px-2 status-bar fw-bold text-center`}
            >
              {percent}%
            </div>
          )}
          {budgetBarLength === DANGER_VALUE && (
            <div
              className={`bg-dark col-${budgetBarLength} fw-bold rounded py-1 px-2 status-bar text-center ${
                month.budget < 0 && "text-danger fw-bold"
              }`}
            >
              {percent}%
            </div>
          )}
          {statusBarLength !== 0 && budgetBarLength !== 0 && (
            <>
              <div
                className={`${statusBarLength <= SUCCESS_VALUE && "bg-success"}
                  ${statusBarLength === WARNING_VALUE && "bg-warning"}
                  ${
                    (statusBarLength === DANGER_VALUE ||
                      month.actual > month.budget) &&
                    "bg-danger"
                  }
                  col-${statusBarLength} border fw-bold rounded-start py-1 px-2 status-bar text-center`}
              >
                {percent}%
              </div>
              <div
                className={`bg-dark col-${budgetBarLength} border rounded-end status-bar`}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default HistoryTableRow;
