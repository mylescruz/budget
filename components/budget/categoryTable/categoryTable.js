import { Button, Table } from "react-bootstrap";
import React, { useContext, useState } from "react";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import PopUp from "@/components/layout/popUp";
import AddCategoryModal from "./addCategoryModal";
import ChangingCategoryRow from "./changingCategoryRow";
import FixedCategoryRow from "./fixedCategoryRow";
import dollarFormatter from "@/helpers/dollarFormatter";
import ProgressBar from "@/components/layout/progressBar";
import EditCategoryModal from "./editCategoryModal/editCategoryModal";
import ConfirmDeleteCategoryModal from "./editCategoryModal/confirmDeleteCategoryModal";

const SAFE_LIMIT = Math.round((10 / 12) * 100);
const MAX_VALUE = 100;

const categoryColumn = "col-6 col-md-4 col-lg-3 d-flex align-items-center";
const budgetColumn =
  "d-none d-lg-flex col-lg-2 align-items-center justify-content-end";
const spentColumn = "col-3 col-md-2 text-end";
const leftColumn =
  "col-3 col-md-2 text-end d-flex align-items-center justify-content-end";
const progressColumn = "d-none d-md-block col-md-4 col-lg-3";

const CategoryTable = ({ dateInfo }) => {
  const { categories, categoryTotals } = useContext(CategoriesContext);

  const [modal, setModal] = useState("none");
  const [editedCategory, setEditedCategory] = useState({});

  const openAddModal = () => {
    setModal("add");
  };

  let percent = Math.round(
    (categoryTotals.actual / categoryTotals.budget) * 100,
  );

  if (
    categoryTotals.budget < 0 &&
    categoryTotals.actual > categoryTotals.budget
  ) {
    percent = Math.round(
      ((categoryTotals.actual + categoryTotals.budget * -1) /
        -categoryTotals.budget) *
        100,
    );
  }

  let remainingTextColor;

  if (percent <= SAFE_LIMIT) {
    remainingTextColor = "text-success";
  } else if (percent > SAFE_LIMIT && percent <= MAX_VALUE) {
    remainingTextColor = "text-warning";
  } else {
    remainingTextColor = "text-danger";
  }

  return (
    <>
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
            <th className="col-3 col-md-2 d-lg-none text-end fw-bold">
              Charged
            </th>
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
            <th className="col-6 col-md-4 col-lg-3 d-flex align-items-center">
              Month Totals
            </th>
            <th className="col-3 col-md-2 d-lg-none d-flex align-items-center justify-content-end">
              {dollarFormatter(categoryTotals.actual)}
            </th>
            <th className="d-none d-lg-flex col-lg-2 align-items-center justify-content-end">
              {dollarFormatter(categoryTotals.budget)}
            </th>
            <th className="d-none d-lg-flex col-lg-2 align-items-center justify-content-end">
              {dollarFormatter(categoryTotals.actual)}
            </th>
            <th className="col-3 col-md-2 text-end d-flex align-items-center justify-content-end">
              <span className={remainingTextColor}>
                {dollarFormatter(categoryTotals.remaining)}
              </span>
            </th>
            <th className="d-none d-md-block col-md-4 col-lg-3">
              <ProgressBar
                actualValue={categoryTotals.actual}
                budgetValue={categoryTotals.budget}
                fixedCategory={false}
              />
            </th>
          </tr>
        </tfoot>
      </Table>

      {modal === "add" && (
        <AddCategoryModal
          dateInfo={dateInfo}
          modal={modal}
          setModal={setModal}
        />
      )}

      {modal === "edit" && (
        <EditCategoryModal
          editedCategory={editedCategory}
          setEditedCategory={setEditedCategory}
          dateInfo={dateInfo}
          modal={modal}
          setModal={setModal}
        />
      )}

      {modal === "delete" && (
        <ConfirmDeleteCategoryModal
          editedCategory={editedCategory}
          dateInfo={dateInfo}
          modal={modal}
          setModal={setModal}
        />
      )}
    </>
  );
};

export default CategoryTable;
