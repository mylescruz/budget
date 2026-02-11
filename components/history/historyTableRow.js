import dollarFormatter from "@/helpers/dollarFormatter";
import monthFormatter from "@/helpers/monthFormatter";
import { useRouter } from "next/router";
import ProgressBar from "../layout/progressBar";

const monthColumn =
  "col-3 col-md-3 col-lg-2 d-flex align-items-center click fw-bold";
const budgetColumn =
  "col-3 col-md-2 d-flex align-items-center justify-content-end";
const spentColumn =
  "col-3 col-md-2 d-flex align-items-center justify-content-end";
const remainingColumn =
  "d-none col-md-2 d-md-flex align-items-center justify-content-end";
const progressColumn = "col-3 col-lg-4";

const HistoryTableRow = ({ month }) => {
  const router = useRouter();

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
        <ProgressBar
          actualValue={month.actual}
          budgetValue={month.budget}
          fixedCategory={false}
        />
      </td>
    </tr>
  );
};

export default HistoryTableRow;
