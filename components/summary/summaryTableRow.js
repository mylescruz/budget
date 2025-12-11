import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import centsToDollars from "@/helpers/centsToDollars";
import CategoryTransactionsModal from "./categoryTransactionsModal";

const SummaryTableRow = ({ category, year }) => {
  const [categoryName, setCategoryName] = useState(category.name);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [showCategoryTransactions, setShowCategoryTransactions] =
    useState(false);

  const openTransactionsModal = (category) => {
    setCategoryName(category);
    setShowCategoryTransactions(true);
  };

  const closeTransactionsModal = () => {
    setShowCategoryTransactions(false);
  };

  const categoryColor = {
    backgroundColor: category.color,
    border: category.color,
  };

  const dropdownSubcategories = () => {
    setShowSubcategories(!showSubcategories);
  };

  return (
    <>
      <tr className="d-flex">
        <th className="col-4">
          {category.subcategories.length > 0 ? (
            <Row className="d-flex" onClick={dropdownSubcategories}>
              <Col className="col-9 cell">
                <Button
                  style={categoryColor}
                  className="btn-sm fw-bold pe-none"
                >
                  {category.name}
                </Button>
              </Col>
              <Col className="col-3 text-end">
                <i
                  className={`clicker bi ${
                    showSubcategories ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                />
              </Col>
            </Row>
          ) : (
            <Row
              className={`col-12 cell ${!category.fixed && "clicker"}`}
              onClick={() => {
                !category.fixed && openTransactionsModal(category.name);
              }}
            >
              <Col>
                <Button
                  style={categoryColor}
                  className="btn-sm fw-bold pe-none"
                >
                  {category.name}
                </Button>
              </Col>
            </Row>
          )}
        </th>
        <td
          className={`d-none d-md-block col-md-2 cell fw-bold ${
            category.budget < 0 && "text-danger "
          }`}
        >
          {centsToDollars(category.budget)}
        </td>
        <td className="col-4 col-md-2 cell">
          {centsToDollars(category.actual)}
        </td>
        <td
          className={`d-none d-md-block col-md-2 cell ${
            category.budget - category.actual < 0 && "text-danger fw-bold"
          }`}
        >
          {!category.fixed && centsToDollars(category.budget - category.actual)}
        </td>
        <td className="col-4 col-md-2 cell">
          {centsToDollars(category.average)}
        </td>
      </tr>
      {showSubcategories &&
        category.subcategories.map((subcategory) => (
          <tr key={subcategory.id} className="d-flex">
            <th
              className={`col-4 cell text-end ${!category.fixed && "clicker"}`}
              onClick={() => {
                !category.fixed && openTransactionsModal(subcategory.name);
              }}
            >
              {subcategory.name}
            </th>
            <td className="d-none d-md-block col-md-2"></td>
            <td className="col-4 col-md-2">
              <span className="mx-2">{centsToDollars(subcategory.actual)}</span>
            </td>
            <td className="d-none d-md-block col-md-2"></td>
            <td className="col-4 col-md-2">
              {centsToDollars(subcategory.average)}
            </td>
          </tr>
        ))}

      {showCategoryTransactions && (
        <CategoryTransactionsModal
          year={year}
          category={categoryName}
          showCategoryTransactions={showCategoryTransactions}
          closeTransactionsModal={closeTransactionsModal}
        />
      )}
    </>
  );
};

export default SummaryTableRow;
