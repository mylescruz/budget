import PopUp from "@/components/ui/popUp";
import { Button, Table } from "react-bootstrap";
import dollarFormatter from "@/helpers/dollarFormatter";
import ProgressBar from "@/components/ui/progressBar";
import { useContext } from "react";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import FixedCategoryRow from "./fixedCategories/fixedCategoryRow";
import ChangingCategoryRow from "./changingCategories/changingCategoryRow";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";
import addDecimalValues from "@/helpers/addDecimalValues";

const WARNING_PERCENTAGE = 10;

const categoryColumn = "col-6 col-md-4 col-lg-3 d-flex align-items-center";
const budgetColumn =
  "d-none d-lg-flex col-lg-2 align-items-center justify-content-end";
const spentColumn = "col-3 col-md-2 text-end";
const leftColumn =
  "col-3 col-md-2 text-end d-flex align-items-center justify-content-end";
const progressColumn = "d-none d-md-block col-md-4 col-lg-3";

const CategoryTable = ({ dateInfo, setEditedCategory, setModal }) => {
  const { categories, categoryTotals } = useContext(CategoriesContext);
  const { transactions } = useContext(TransactionsContext);

  // Calculate the money transferred in and out of a user's account
  const transfers = transactions.reduce(
    (sum, current) => {
      if (current.type === "Transfer") {
        if (current.toAccount === "Checking") {
          sum.in += dollarsToCents(current.amount);
        }

        if (current.toAccount === "Savings") {
          sum.out += dollarsToCents(current.amount);
        }
      }

      return sum;
    },
    { in: 0, out: 0 },
  );

  const transfersIn = centsToDollars(transfers.in);
  const transfersOut = centsToDollars(transfers.out);

  // Get the total available funds for the month
  const availableFunds = addDecimalValues(categoryTotals.income, transfersIn);

  const leftoverVariableFunds = centsToDollars(
    dollarsToCents(availableFunds) -
      dollarsToCents(categoryTotals.fixedBudget) -
      dollarsToCents(categoryTotals.variableActual) -
      transfers.out,
  );

  // Define the text color of the amount values for the cards
  const variableSpendingPercentage = Math.round(
    (leftoverVariableFunds / availableFunds) * 100,
  );

  let leftoverFundsColor;

  // Show red text if the user has no income or if their available spending balance is less than 0
  if (variableSpendingPercentage <= 0 && leftoverVariableFunds <= 0) {
    leftoverFundsColor = "text-danger";
  } else if (
    variableSpendingPercentage >= 0 &&
    variableSpendingPercentage < WARNING_PERCENTAGE
  ) {
    leftoverFundsColor = "text-warning";
  } else {
    leftoverFundsColor = "text-success";
  }

  const openAddModal = () => {
    setModal("add");
  };

  return (
    <Table striped>
      <thead>
        <tr className="d-flex table-secondary">
          <th className="col-6 fs-5">Categories</th>
          <th className="col-6 d-flex align-items-center justify-content-end">
            <Button size="sm" onClick={openAddModal}>
              Add Category
            </Button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="table-dark">
          <th colSpan={1}>
            Fixed Expenses
            <PopUp
              title="Your expenses that remain the same each month."
              id="fixed-expenses-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
        </tr>
        <tr className="d-flex table-light">
          <th className="col-6 col-md-4 col-lg-3">Category</th>
          <th className="col-3 col-md-2 d-lg-none text-end fw-bold">Charged</th>
          <th className="col-3 col-md-2 text-end">Amount</th>
          <th className="d-none d-lg-block col-lg-2 text-end">Charged</th>
          <th className="d-none d-lg-block col-lg-2 text-end">Due</th>
          <th className="d-none d-md-block col-md-4 col-lg-3">Progress</th>
        </tr>
        {categories.map(
          (category) =>
            category.fixed && (
              <FixedCategoryRow
                key={category._id}
                category={category}
                dateInfo={dateInfo}
                setEditedCategory={setEditedCategory}
                setModal={setModal}
              />
            ),
        )}
        <tr className="d-flex table-secondary">
          <th className="col-6 col-md-4 col-lg-3">Totals</th>
          <th className="col-3 col-md-2 d-lg-none text-end fw-bold">
            {dollarFormatter(categoryTotals.fixedActual)}
          </th>
          <th className="col-3 col-md-2 text-end">
            {dollarFormatter(categoryTotals.fixedBudget)}
          </th>
          <th className="d-none d-lg-block col-lg-2 text-end">
            {dollarFormatter(categoryTotals.fixedActual)}
          </th>
          <th className="d-none d-lg-block col-lg-2 text-end" />
          <th className="d-none d-md-block col-md-4 col-lg-3" />
        </tr>
        <tr className="table-dark">
          <th colSpan={1}>
            Changing Expenses
            <PopUp
              title="Your expenses that change depending on your spending."
              id="variable-expenses-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
        </tr>
        <tr className="d-flex table-light">
          <th className={categoryColumn}>Category</th>
          <th className={budgetColumn}>Budget</th>
          <th className={spentColumn}>Spent</th>
          <th className={leftColumn}>Left</th>
          <th className={progressColumn}>Progress</th>
        </tr>
        {categories.map(
          (category) =>
            !category.fixed && (
              <ChangingCategoryRow
                key={category._id}
                category={category}
                setEditedCategory={setEditedCategory}
                setModal={setModal}
              />
            ),
        )}
        <tr className="d-flex table-secondary">
          <th className={categoryColumn}>Totals</th>
          <th className={budgetColumn}>
            <span
              className={
                categoryTotals.variableBudget < 0 ? "fw-bold text-danger" : ""
              }
            >
              {dollarFormatter(categoryTotals.variableBudget)}
            </span>
          </th>
          <th className={spentColumn}>
            {dollarFormatter(categoryTotals.variableActual)}
          </th>
          <th className={leftColumn}>
            <span
              className={
                categoryTotals.variableRemaining < 0
                  ? "fw-bold text-danger"
                  : ""
              }
            >
              {dollarFormatter(categoryTotals.variableRemaining)}
            </span>
          </th>
          <th className={progressColumn} />
        </tr>
      </tbody>
    </Table>
  );
};

export default CategoryTable;
