import { Button, Col, Row, Table } from "react-bootstrap";
import CategoryTableRow from "./categoryTableRow";
import CategoryTableFooter from "./categoryTableFooter";
import React, { useContext, useEffect, useState } from "react";
import FixedCategoryTableRow from "./fixedCategoryTableRow";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import useHistory from "@/hooks/useHistory";
import PopUp from "@/components/layout/popUp";

const CategoryTable = ({ setEditCategories, monthInfo }) => {
  const { categories, categoriesLoading } = useContext(CategoriesContext);

  const { historyLoading, putHistory, getMonthHistory } = useHistory();

  const [showFixedExpenses, setShowFixedExpenses] = useState(true);
  const [showVariableExpenses, setShowVariableExpenses] = useState(true);

  // Updates the budget and the money actual spent in the history array when the categories array changes
  useEffect(() => {
    const updateHistoryValues = async () => {
      let totalActual = 0;
      categories.forEach((category) => {
        totalActual += parseFloat(category.actual);
      });

      const foundMonth = getMonthHistory(monthInfo);

      // Updates the given month's actual and leftover value by sending a PUT request to the API
      if (foundMonth) {
        const newActual = parseFloat(totalActual.toFixed(2));
        const newLeftover = parseFloat(
          (foundMonth.budget - totalActual).toFixed(2)
        );

        if (
          newActual !== foundMonth.actual &&
          newLeftover !== foundMonth.leftover
        ) {
          putHistory({
            ...foundMonth,
            actual: newActual,
            leftover: newLeftover,
          });
        }
      }
    };

    if (!categoriesLoading && !historyLoading) {
      updateHistoryValues();
    }
  }, [
    categories,
    categoriesLoading,
    getMonthHistory,
    historyLoading,
    monthInfo,
    putHistory,
  ]);

  const handleEdit = () => {
    setEditCategories(true);
  };

  const displayFixedExpenses = () => {
    setShowFixedExpenses(!showFixedExpenses);
  };

  const displayVariableExpenses = () => {
    setShowVariableExpenses(!showVariableExpenses);
  };

  return (
    <Table striped>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-6">
            <Row className="d-flex">
              <Col className="col-8 col-sm-9 col-lg-10 col-xl-9">
                Category
                <PopUp
                  title="You can edit and add categories and their subcategories. You can also edit their budget and color."
                  id="categories-info"
                >
                  <span> &#9432;</span>
                </PopUp>
              </Col>
              <Col className="col-4 col-sm-3 col-lg-2 col-xl-3">
                <Button
                  className="btn-sm"
                  id="edit-categories-btn"
                  variant="secondary"
                  onClick={handleEdit}
                >
                  Edit
                </Button>
              </Col>
            </Row>
          </th>
          <th className="col-3 col-md-2">Budget</th>
          <th className="col-3 col-md-2">Spent</th>
          <th className="d-none d-md-block col-md-2 cell">Remaining</th>
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
                <FixedCategoryTableRow key={category.id} category={category} />
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
                <CategoryTableRow key={category.id} category={category} />
              )
          )}
      </tbody>
      <tfoot className="table-dark">
        <CategoryTableFooter />
      </tfoot>
    </Table>
  );
};

export default CategoryTable;
