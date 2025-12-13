import currencyFormatter from "@/helpers/currencyFormatter";
import monthFormatter from "@/helpers/monthFormatter";
import Link from "next/link";

const HistoryTableRow = ({ month }) => {
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
    <tr className="d-flex">
      <td className="col-3 col-md-3 click fw-bold">
        <Link
          href={{
            pathname: "/history/[month]",
            query: { month: month.month, year: month.year },
          }}
        >
          <>
            <span className="d-sm-none">
              {monthFormatter(`${month.month}/01/${month.year}`, "2-digit")}
            </span>
            <span className="d-none d-sm-block">
              {monthFormatter(`${month.month}/01/${month.year}`, "long")}
            </span>
          </>
        </Link>
      </td>
      <td className="col-3 col-md-2">
        <span className="fw-bold">
          {currencyFormatter.format(month.budget)}
        </span>
      </td>
      <td className="col-3 col-md-2">
        {currencyFormatter.format(month.actual)}
      </td>
      <td className="d-none d-md-block col-md-2">
        <span className={`${month.leftover < 0 && "text-danger fw-bold"}`}>
          {currencyFormatter.format(month.leftover)}
        </span>
      </td>
      <td className="col-3 col-md-3">
        <div className="d-flex flex-row align-items-center text-white text-end">
          {statusBarLength === 12 && (
            <div
              className={`${
                month.actual > month.budget ? "bg-danger" : "bg-warning"
              } col-${statusBarLength} rounded py-1 px-2 status-bar text-center`}
            >
              {percent}%
            </div>
          )}
          {budgetBarLength === 12 && (
            <div
              className={`bg-dark col-${budgetBarLength} rounded py-1 px-2 status-bar text-center ${
                month.budget < 0 && "text-danger"
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
                    (statusBarLength === 12 || month.actual > month.budget) &&
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
      </td>
    </tr>
  );
};

export default HistoryTableRow;
