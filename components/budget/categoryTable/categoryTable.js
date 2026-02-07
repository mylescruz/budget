import { Button, Table } from "react-bootstrap";
import React, { useContext, useState } from "react";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import PopUp from "@/components/layout/popUp";
import AddCategoryModal from "./addCategoryModal";
import ChangingCategoryRow from "./changingCategoryRow";
import FixedCategoryRow from "./fixedCategoryRow";
import dollarFormatter from "@/helpers/dollarFormatter";

const categoryColumn = "col-6 col-md-4 col-lg-3 d-flex align-items-center";
const fixedAmountColumn = "col-3 col-md-2 text-end";
const budgetColumn =
  "d-none d-lg-flex col-lg-2 align-items-center justify-content-end";
const chargedColumn =
  "col-3 col-md-2 col-lg-2 d-flex align-items-center justify-content-end";
const dayColumn = "d-none d-lg-block col-lg-2 text-end";
const spentColumn = "col-3 col-md-2 text-end";
const leftColumn =
  "col-3 col-md-2 text-end d-flex align-items-center justify-content-end";
const progressColumn = "d-none d-md-block col-md-4 col-lg-3";

const SUCCESS_VALUE = 10;
const WARNING_VALUE = 11;
const DANGER_VALUE = 12;

const CategoryTable = ({ dateInfo }) => {
  const { categories, categoryTotals } = useContext(CategoriesContext);

  const [addCategoryClicked, setAddCategoryClicked] = useState(false);

  const addNewCategory = () => {
    setAddCategoryClicked(true);
  };

  const addCategoryProps = {
    addCategoryClicked: addCategoryClicked,
    setAddCategoryClicked: setAddCategoryClicked,
  };

  let statusBarLength;
  let budgetBarLength;
  let percent;

  statusBarLength = Math.round(
    (categoryTotals.actual * 12) / categoryTotals.budget,
  );

  if (categoryTotals.actual < categoryTotals.budget && statusBarLength === 12) {
    statusBarLength = 11;
  }

  if (statusBarLength > 12) {
    statusBarLength = 12;
  }

  if (categoryTotals.actual > 0 && statusBarLength <= 0) {
    statusBarLength = 12;
  }

  budgetBarLength = 12 - statusBarLength;

  percent = Math.round((categoryTotals.actual / categoryTotals.budget) * 100);

  if (
    categoryTotals.actual > categoryTotals.budget &&
    categoryTotals.budget < 0
  ) {
    percent = Math.round(
      ((categoryTotals.actual + categoryTotals.budget * -1) /
        -categoryTotals.budget) *
        100,
    );
  }

  return (
    <>
      <Table striped>
        <thead>
          <tr className="d-flex table-secondary">
            <th className="col-6 fs-5">Categories</th>
            <th className="col-6 d-flex align-items-center justify-content-end">
              <Button size="sm" onClick={addNewCategory}>
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
            <th className={categoryColumn}>Category</th>
            <th className={chargedColumn}>Charged</th>
            <th className={fixedAmountColumn}>Amount</th>
            <th className={dayColumn}>Due</th>
            <th className={progressColumn}>Progress</th>
          </tr>
          {categories.map(
            (category) =>
              category.fixed && (
                <FixedCategoryRow
                  key={category._id}
                  category={category}
                  dateInfo={dateInfo}
                />
              ),
          )}
          <tr className="d-flex table-secondary">
            <th className={categoryColumn}>Totals</th>
            <th className={fixedAmountColumn}>
              {dollarFormatter(categoryTotals.fixedActual)}
            </th>
            <th className={chargedColumn}>
              {dollarFormatter(categoryTotals.fixedBudget)}
            </th>
            <th className={dayColumn} />
            <th className={progressColumn} />
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
                  dateInfo={dateInfo}
                />
              ),
          )}
          <tr className="d-flex table-secondary">
            <th className={categoryColumn}>Totals</th>
            <th className={budgetColumn}>
              <span
                className={
                  categoryTotals.nonFixedBudget < 0 ? "fw-bold text-danger" : ""
                }
              >
                {dollarFormatter(categoryTotals.nonFixedBudget)}
              </span>
            </th>
            <th className={spentColumn}>
              {dollarFormatter(categoryTotals.nonFixedActual)}
            </th>
            <th className={leftColumn}>
              <span
                className={
                  categoryTotals.nonFixedRemaining < 0
                    ? "fw-bold text-danger"
                    : ""
                }
              >
                {dollarFormatter(categoryTotals.nonFixedRemaining)}
              </span>
            </th>
            <th className={progressColumn} />
          </tr>
        </tbody>
        <tfoot>
          <tr className="d-flex table-dark">
            <th className={categoryColumn}>Month Totals</th>
            <th className={budgetColumn}>
              {dollarFormatter(categoryTotals.budget)}
            </th>
            <th className={chargedColumn}>
              {dollarFormatter(categoryTotals.actual)}
            </th>
            <th className={leftColumn}>
              <span
                className={
                  percent < 85
                    ? "text-success"
                    : percent >= 85 && percent < 100
                      ? "text-warning"
                      : "text-danger"
                }
              >
                {dollarFormatter(categoryTotals.remaining)}
              </span>
            </th>
            <th className={progressColumn}>
              <div className="d-flex flex-row align-items-center text-white text-end">
                {statusBarLength === DANGER_VALUE && (
                  <div
                    className={`${
                      categoryTotals.actual > categoryTotals.budget
                        ? "bg-danger"
                        : "bg-warning"
                    } col-${statusBarLength} rounded py-1 px-2 status-bar text-center`}
                  >
                    {percent === Infinity ? (
                      "NO BUDGET"
                    ) : (
                      <span>{percent}%</span>
                    )}
                  </div>
                )}
                {budgetBarLength === DANGER_VALUE && (
                  <div
                    className={`bg-dark col-${budgetBarLength} rounded py-1 px-2 status-bar text-center ${
                      categoryTotals.budget < 0 && "text-danger"
                    }`}
                  >
                    {percent}%
                  </div>
                )}
                {statusBarLength !== 0 && budgetBarLength !== 0 && (
                  <>
                    <div
                      className={`${
                        statusBarLength <= SUCCESS_VALUE && "bg-success"
                      }
                  ${statusBarLength === WARNING_VALUE && "bg-warning"}
                  ${
                    (statusBarLength === DANGER_VALUE ||
                      categoryTotals.actual > categoryTotals.budget) &&
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
            </th>
          </tr>
        </tfoot>
      </Table>

      <AddCategoryModal {...addCategoryProps} />
    </>
  );
};

export default CategoryTable;
