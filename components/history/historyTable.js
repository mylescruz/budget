import { Table } from "react-bootstrap";
import currencyFormatter from "@/helpers/currencyFormatter";
import Link from "next/link";
import monthFormatter from "@/helpers/monthFormatter";
import PopUp from "../layout/popUp";
import historySorter from "@/helpers/historySorter";

const HistoryTable = ({ history }) => {
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
      </tbody>
    </Table>
  );
};

export default HistoryTable;
