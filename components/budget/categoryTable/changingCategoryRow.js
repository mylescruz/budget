import { useState } from "react";
import PopUp from "@/components/layout/popUp";
import EditCategoryModal from "./editCategoryModal/editCategoryModal";
import ChangingSubcategoryRow from "./changingSubcategoryRow";
import dollarFormatter from "@/helpers/dollarFormatter";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";
import ProgressBar from "@/components/layout/progressBar";

const categoryColumn = "col-6 col-md-4 col-lg-3 d-flex justify-content-between";
const budgetColumn = "d-none d-lg-block col-lg-2 cell fw-bold text-end";
const spentColumn = "col-3 col-md-2 cell text-end";
const leftColumn = "col-3 col-md-2 cell text-end";
const progressColumn = "d-none d-md-block col-md-4 col-lg-3 fw-bold";

const ChangingCategoryRow = ({ category, dateInfo }) => {
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [editCategoryClicked, setEditCategoryClicked] = useState(false);
  const subcategories = [...category.subcategories].sort(
    (a, b) => b.actual - a.actual,
  );

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
        <th className={categoryColumn}>
          <div className="d-flex align-items-center cell">
            <span
              style={categoryColor}
              className="badge fw-bold fs-6 text-white"
            >
              {category.name.length > 14
                ? category.name.slice(0, 14) + "..."
                : category.name}
              {category.noDelete && (
                <PopUp
                  title="The money you can spend on anything after all other expenses have been covered."
                  id="fun-money-info"
                >
                  <span> &#9432;</span>
                </PopUp>
              )}
            </span>
            {category.subcategories.length > 0 && (
              <i
                className={`clicker mx-2 bi ${
                  showSubcategories ? "bi-chevron-up" : "bi-chevron-down"
                }`}
                onClick={dropdownSubcategories}
              />
            )}
          </div>
          <p className="mx-2 my-0 clicker" onClick={editCategory}>
            &#8942;
          </p>
        </th>
        <td className={budgetColumn}>
          <span className={`${category.budget < 0 && "text-danger"}`}>
            {dollarFormatter(category.budget)}
          </span>
        </td>
        <td className={spentColumn}>{dollarFormatter(category.actual)}</td>
        <td className={leftColumn}>
          <span
            className={`${
              category.actual > category.budget && "text-danger fw-bold"
            }`}
          >
            {dollarFormatter(
              subtractDecimalValues(category.budget, category.actual),
            )}
          </span>
        </td>
        <td className={progressColumn}>
          <ProgressBar
            actualValue={category.actual}
            budgetValue={category.budget}
            fixedCategory={category.fixed}
          />
        </td>
      </tr>
      {showSubcategories &&
        subcategories.map((subcategory) => (
          <ChangingSubcategoryRow
            key={subcategory.id}
            subcategory={subcategory}
          />
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

export default ChangingCategoryRow;
