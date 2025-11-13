import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import SubcategoryRow from "./subcategoryRow";
import PopUp from "@/components/layout/popUp";
import centsToDollars from "@/helpers/centsToDollars";
import EditCategoryModal from "./editCategoryModal";

const CategoryTableRow = ({ category, dateInfo }) => {
  const hasSubcategory = category.hasSubcategory;
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [editCategoryClicked, setEditCategoryClicked] = useState(false);

  const categoryColor = {
    backgroundColor: category.color,
    border: category.color,
  };

  const dropdownSubcategories = () => {
    setShowSubcategories(!showSubcategories);
  };

  const editCategory = () => {
    setEditCategoryClicked(true);
  };

  return (
    <>
      <tr className="d-flex">
        <th className="col-5 col-md-5" onClick={dropdownSubcategories}>
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
                  {category.noDelete && (
                    <PopUp
                      title="The money you can spend on anything after all other expenses have been covered."
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
            category.budget < 0 && "text-danger"
          }`}
        >
          {!category.fixed && centsToDollars(category.budget)}
        </td>
        <td className="col-3 col-md-2 cell">
          {centsToDollars(category.actual)}
        </td>
        <td
          className={`d-none d-md-block col-md-2 cell ${
            category.budget - category.actual < 0 && "text-danger fw-bold"
          }`}
        >
          {!category.fixed && centsToDollars(category.budget - category.actual)}
        </td>
        <td className="col-1 cell clicker" onClick={editCategory}>
          &#8286;
        </td>
      </tr>
      {showSubcategories &&
        category.subcategories.map((subcategory) => (
          <SubcategoryRow key={subcategory.id} subcategory={subcategory} />
        ))}

      {editCategoryClicked && (
        <EditCategoryModal
          category={category}
          dateInfo={dateInfo}
          editCategoryClicked={editCategoryClicked}
          setEditCategoryClicked={setEditCategoryClicked}
        />
      )}
    </>
  );
};

export default CategoryTableRow;
