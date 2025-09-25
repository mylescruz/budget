import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import SubcategoryRow from "./subcategoryRow";
import PopUp from "@/components/layout/popUp";
import centsToDollars from "@/helpers/centsToDollars";

const CategoryTableRow = ({ category }) => {
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
        <th className="col-6 col-md-6" onClick={dropdownSubcategories}>
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
                  {/* Show the pop up message for the Guilt Free Spending category */}
                  {category.name === "Guilt Free Spending" && (
                    <PopUp
                      title="The money you can spend on whatever you want after all other expenses have been covered."
                      id="guilt-free-info"
                    >
                      <span> &#9432;</span>
                    </PopUp>
                  )}
                </Col>
                <Col className="col-3 text-end">
                  <i
                    className={`clicker bi ${
                      showSubcategories ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
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
        <td
          className={`col-3 col-md-2 cell fw-bold ${
            category.budget < 0 && "text-danger "
          }`}
        >
          {centsToDollars(category.budget)}
        </td>
        <td className="col-3 col-md-2 cell">
          {centsToDollars(category.actual)}
        </td>
        <td
          className={`d-none d-md-block col-md-2 cell ${
            category.budget - category.actual < 0 && "text-danger fw-bold"
          }`}
        >
          {centsToDollars(category.budget - category.actual)}
        </td>
      </tr>
      {showSubcategories &&
        category.subcategories.map((subcategory) => (
          <SubcategoryRow key={subcategory.id} subcategory={subcategory} />
        ))}
    </>
  );
};

export default CategoryTableRow;
