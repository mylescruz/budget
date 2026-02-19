import { Container, Table } from "react-bootstrap";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";
import dollarFormatter from "@/helpers/dollarFormatter";
import CategorySummaryTableRow from "./categorySummaryTableRow";

const categoryColumn = "col-6 col-md-3";
const budgetColumn = "d-none d-md-block col-md-2 text-end";
const spentColumn = "col-3 col-md-2 text-end";
const leftColumn = "d-none d-md-block col-md-2 text-end";
const averageColumn = "col-3 col-md-2 text-end";
const monthsColumn = "d-none d-md-block col-md-1 text-end";

const CategorySummaryTable = ({ categories, year, monthsLength }) => {
  const totalBudget = centsToDollars(
    categories.reduce(
      (sum, current) => sum + dollarsToCents(current.budget),
      0,
    ),
  );

  const totalActual = centsToDollars(
    categories.reduce(
      (sum, current) => sum + dollarsToCents(current.actual),
      0,
    ),
  );

  const totalLeft = subtractDecimalValues(totalBudget, totalActual);

  return (
    <Container className="d-flex flex-column align-items-center">
      <Table striped>
        <thead className="table-dark">
          <tr className="d-flex">
            <th className={categoryColumn}>Category</th>
            <th className={budgetColumn}>Yearly Budget</th>
            <th className={spentColumn}>Yearly Spent</th>
            <th className={leftColumn}>Yearly Left</th>
            <th className={averageColumn}>Avg Month</th>
            <th className={monthsColumn}>Months</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <CategorySummaryTableRow
              key={category.name}
              category={category}
              year={year}
            />
          ))}
        </tbody>
        <tfoot className="table-dark">
          <tr className="d-flex">
            <th className={categoryColumn}>Totals</th>
            <th className={budgetColumn}>{dollarFormatter(totalBudget)}</th>
            <th className={spentColumn}>{dollarFormatter(totalActual)}</th>
            <th className={leftColumn}>
              <span className={totalLeft >= 0 ? "text-white" : "text-danger"}>
                {dollarFormatter(totalLeft)}
              </span>
            </th>
            <th className={averageColumn}>
              {dollarFormatter(totalActual / monthsLength)}
            </th>
            <th className={monthsColumn} />
          </tr>
        </tfoot>
      </Table>
    </Container>
  );
};

export default CategorySummaryTable;
