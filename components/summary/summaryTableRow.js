import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import dollarFormatter from "@/helpers/dollarFormatter";

const SummaryTableRow = ({ category, year }) => {
  const [showSubcategories, setShowSubcategories] = useState(false);

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
            <Row className="col-12 cell">
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
          {dollarFormatter(category.budget)}
        </td>
        <td className="col-4 col-md-2 cell">
          {dollarFormatter(category.actual)}
        </td>
        <td
          className={`d-none d-md-block col-md-2 cell ${
            category.budget - category.actual < 0 && "text-danger fw-bold"
          }`}
        >
          {!category.fixed &&
            dollarFormatter(category.budget - category.actual)}
        </td>
        <td className="col-4 col-md-2 cell">
          {dollarFormatter(category.average)}
        </td>
      </tr>
      {showSubcategories &&
        category.subcategories.map((subcategory) => (
          <tr key={subcategory.id} className="d-flex">
            <th
              className={`col-4 cell ${!category.fixed && "clicker"}`}
              onClick={() => {
                !category.fixed && openTransactionsModal(subcategory.name);
              }}
            >
              <span className="mx-2">{subcategory.name}</span>
            </th>
            <td className="d-none d-md-block col-md-2"></td>
            <td className="col-4 col-md-2">
              <span className="mx-2">
                {dollarFormatter(subcategory.actual)}
              </span>
            </td>
            <td className="d-none d-md-block col-md-2"></td>
            <td className="col-4 col-md-2">
              {dollarFormatter(subcategory.average)}
            </td>
          </tr>
        ))}
    </>
  );
};

export default SummaryTableRow;
