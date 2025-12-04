import { Button, Col, Row, Table } from "react-bootstrap";
import CategoryTableRow from "./categoryTableRow";
import CategoryTableFooter from "./categoryTableFooter";
import React, { useContext, useState } from "react";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import PopUp from "@/components/layout/popUp";
import AddCategoryModal from "../addCategoryModal/addCategoryModal";

const CategoryTable = ({ dateInfo }) => {
  const { categories } = useContext(CategoriesContext);

  const [addCategoryClicked, setAddCategoryClicked] = useState(false);
  const [showFixedExpenses, setShowFixedExpenses] = useState(true);
  const [showVariableExpenses, setShowVariableExpenses] = useState(true);

  const addNewCategory = () => {
    setAddCategoryClicked(true);
  };

  const displayFixedExpenses = () => {
    setShowFixedExpenses(!showFixedExpenses);
  };

  const displayVariableExpenses = () => {
    setShowVariableExpenses(!showVariableExpenses);
  };

  const addCategoryProps = {
    dateInfo: dateInfo,
    addCategoryClicked: addCategoryClicked,
    setAddCategoryClicked: setAddCategoryClicked,
  };

  return (
    <>
      <Table striped>
        <thead className="table-dark">
          <tr className="d-flex">
            <th className="col-5">
              <Row className="d-flex">
                <Col className="col-6">Category</Col>
                <Col className="col-6">
                  <Button
                    className="btn-sm"
                    id="save-all-btn"
                    onClick={addNewCategory}
                  >
                    Add
                  </Button>
                </Col>
              </Row>
            </th>
            <th className="col-3 col-md-2">Budget</th>
            <th className="col-3 col-md-2">Spent</th>
            <th className="d-none d-md-block col-md-2 cell">Remaining</th>
            <th className="col-1" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <th
              className="bg-secondary text-white clicker"
              colSpan={1}
              onClick={displayFixedExpenses}
            >
              <Row className="d-flex">
                <Col className="col-10">
                  Fixed Expenses
                  <PopUp
                    title="Your expenses that remain the same each month."
                    id="fixed-expenses-info"
                  >
                    <span> &#9432;</span>
                  </PopUp>
                </Col>
                <Col className="col-2 text-end">
                  <i
                    className={`fw-bold bi ${
                      showFixedExpenses ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  />
                </Col>
              </Row>
            </th>
          </tr>
          {showFixedExpenses &&
            categories.map(
              (category) =>
                category.fixed && (
                  <CategoryTableRow
                    key={category._id}
                    category={category}
                    dateInfo={dateInfo}
                  />
                )
            )}
          <tr>
            <th
              className="bg-secondary text-white clicker"
              colSpan={1}
              onClick={displayVariableExpenses}
            >
              <Row className="d-flex">
                <Col className="col-10">
                  Changing Expenses
                  <PopUp
                    title="Your expenses that change depending on your spending."
                    id="variable-expenses-info"
                  >
                    <span> &#9432;</span>
                  </PopUp>
                </Col>
                <Col className="col-2 text-end">
                  <i
                    className={`fw-bold bi ${
                      showVariableExpenses ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  ></i>
                </Col>
              </Row>
            </th>
          </tr>
          {showVariableExpenses &&
            categories.map(
              (category) =>
                !category.fixed && (
                  <CategoryTableRow
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
