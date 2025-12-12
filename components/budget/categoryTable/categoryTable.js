import { Button, Col, Row, Table } from "react-bootstrap";
import CategoryTableFooter from "./categoryTableFooter";
import React, { useContext, useState } from "react";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import PopUp from "@/components/layout/popUp";
import AddCategoryModal from "../addCategoryModal/addCategoryModal";
import ChangingCategoryRow from "./changingCategoryRow";
import FixedCategoryRow from "./fixedCategoryRow";

const CategoryTable = ({ dateInfo }) => {
  const { categories } = useContext(CategoriesContext);

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
            <th className="col-6 col-md-4 col-lg-3">Category</th>
            <th className="col-3 col-md-2">Amount</th>
            <th className="d-none d-lg-block col-lg-2">Day</th>
            <th className="col-3 col-md-2 col-lg-2">Charged</th>
            <th className="d-none d-md-block col-md-4 col-lg-3" />
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
            <th className="col-6 col-md-4 col-lg-3">Category</th>
            <th className="d-none d-lg-block col-lg-2">Budget</th>
            <th className="col-3 col-md-2">Spent</th>
            <th className="col-3 col-md-2">Left</th>
            <th className="d-none d-md-block col-md-4 col-lg-3">Progress</th>
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
        </tbody>
        <tfoot className="table-dark">
          <CategoryTableFooter />
        </tfoot>
      </Table>

      <AddCategoryModal {...addCategoryProps} />
    </>
  );
};

export default CategoryTable;
