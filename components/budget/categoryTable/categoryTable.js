import { Button, Table } from "react-bootstrap";
import React, { useContext, useState } from "react";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import PopUp from "@/components/layout/popUp";
import AddCategoryModal from "../addCategoryModal/addCategoryModal";
import ChangingCategoryRow from "./changingCategoryRow";
import FixedCategoryRow from "./fixedCategoryRow";
import dollarFormatter from "@/helpers/dollarFormatter";

const categoryColumn = "col-6 col-md-4 col-lg-3";
const fixedAmountColumn = "col-3 col-md-2 text-end";
const budgetColumn = "d-none d-lg-block col-lg-2 text-end";
const chargedColumn = "col-3 col-md-2 col-lg-2 text-end";
const dayColumn = "d-none d-lg-block col-lg-2 text-end";
const spentColumn = "col-3 col-md-2 text-end";
const leftColumn = "col-3 col-md-2 text-end";
const progressColumn = "d-none d-md-block col-md-4 col-lg-3";

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
            <th className={fixedAmountColumn}>Amount</th>
            <th className={chargedColumn}>Charged</th>
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
              )
          )}
          <tr className="d-flex table-secondary">
            <th className={categoryColumn}>Totals</th>
            <th className={fixedAmountColumn}>
              {dollarFormatter(categoryTotals.fixedBudget)}
            </th>
            <th className={chargedColumn}>
              {dollarFormatter(categoryTotals.fixedActual)}
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
              )
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
      </Table>

      <AddCategoryModal {...addCategoryProps} />
    </>
  );
};

export default CategoryTable;
