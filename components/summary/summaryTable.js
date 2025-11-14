import { Table } from "react-bootstrap";
import SummaryTableRow from "./summaryTableRow";
import centsToDollars from "@/helpers/centsToDollars";

const SummaryTable = ({ categories, year }) => {
  const totalBudget = categories.reduce(
    (sum, current) => sum + current.budget,
    0
  );
  const totalActual = categories.reduce(
    (sum, current) => sum + current.actual,
    0
  );
  const totalRemaining = totalBudget - totalActual;

  return (
    <Table striped>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-6">Category</th>
          <th className="col-3 col-md-2">Budget</th>
          <th className="col-3 col-md-2">Spent</th>
          <th className="d-none d-md-block col-md-2 cell">Remaining</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <SummaryTableRow key={category._id} category={category} year={year} />
        ))}
      </tbody>
      <tfoot className="table-dark">
        <tr className="d-flex">
          <th className="col-6">Totals</th>
          <th className="col-3 col-md-2 cell">{centsToDollars(totalBudget)}</th>
          <th className="col-3 col-md-2 cell">{centsToDollars(totalActual)}</th>
          <th
            className={`d-none d-md-block col-md-2 cell ${
              totalRemaining >= 0 ? "text-white" : "text-danger"
            }`}
          >
            {centsToDollars(totalRemaining)}
          </th>
        </tr>
      </tfoot>
    </Table>
  );
};

export default SummaryTable;
