import { Container, Table } from "react-bootstrap";
import SummaryTableRow from "./summaryTableRow";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";

const SummaryTable = ({ categories, year, monthsLength }) => {
  const totalBudget = categories.reduce(
    (sum, current) => sum + dollarsToCents(current.budget),
    0
  );
  const totalActual = categories.reduce(
    (sum, current) => sum + dollarsToCents(current.actual),
    0
  );
  const totalRemaining = totalBudget - totalActual;

  return (
    <Container className="d-flex flex-column align-items-center">
      <Table striped>
        <thead className="table-dark">
          <tr className="d-flex">
            <th className="col-4">Category</th>
            <th className="d-none d-md-block col-md-2">Yearly Budget</th>
            <th className="col-4 col-md-2">Yearly Spent</th>
            <th className="d-none d-md-block col-md-2 cell">Remaining</th>
            <th className="col-4 col-md-2">Avg Monthly Spent</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <SummaryTableRow
              key={category._id}
              category={category}
              year={year}
            />
          ))}
        </tbody>
        <tfoot className="table-dark">
          <tr className="d-flex">
            <th className="col-4">Totals</th>
            <th className="d-none d-md-block col-md-2 cell">
              {centsToDollars(totalBudget)}
            </th>
            <th className="col-4 col-md-2 cell">
              {centsToDollars(totalActual)}
            </th>
            <th
              className={`d-none d-md-block col-md-2 cell ${
                totalRemaining >= 0 ? "text-white" : "text-danger"
              }`}
            >
              {centsToDollars(totalRemaining)}
            </th>
            <th className="col-4 col-md-2">
              {centsToDollars(totalActual / monthsLength)}
            </th>
          </tr>
        </tfoot>
      </Table>
    </Container>
  );
};

export default SummaryTable;
