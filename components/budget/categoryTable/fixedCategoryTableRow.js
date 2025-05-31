import currencyFormatter from "@/helpers/currencyFormatter";
import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import FixedSubcategoryRow from "./fixedSubcategoryRow";

const FixedCategoryTableRow = ({ category }) => {
  const hasSubcategory = category.hasSubcategory;
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
        <th className="col-6" onClick={dropdownSubcategories}>
          <Row className="d-flex">
            {hasSubcategory ? (
              <>
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
                    className={`clicker bi ${showSubcategories ? "bi-chevron-up" : "bi-chevron-down"}`}
                  />
                </Col>
              </>
            ) : (
              <Col className="col-12 cell">
                <Button
                  style={categoryColor}
                  className="btn-sm fw-bold pe-none"
                >
                  {category.name}
                </Button>
              </Col>
            )}
          </Row>
        </th>
        <td className="d-none d-md-block col-md-2 fw-bold"></td>
        <td className="col-3 col-md-2 cell fw-bold">
          {currencyFormatter.format(category.actual)}
        </td>
        <td className="col-3 col-md-2 cell"></td>
      </tr>
      {showSubcategories &&
        category.subcategories.map((subcategory) => (
          <FixedSubcategoryRow key={subcategory.id} subcategory={subcategory} />
        ))}
    </>
  );
};

export default FixedCategoryTableRow;
