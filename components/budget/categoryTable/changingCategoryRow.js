import { useState } from "react";
import PopUp from "@/components/layout/popUp";
import EditCategoryModal from "./editCategoryModal/editCategoryModal";
import ChangingSubcategoryRow from "./changingSubcategoryRow";
import dollarFormatter from "@/helpers/dollarFormatter";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";

const categoryColumn = "col-6 col-md-4 col-lg-3 d-flex justify-content-between";
const budgetColumn = "d-none d-lg-block col-lg-2 cell fw-bold text-end";
const spentColumn = "col-3 col-md-2 cell text-end";
const leftColumn = "col-3 col-md-2 cell text-end";
const progressColumn = "d-none d-md-block col-md-4 col-lg-3 fw-bold";

const SUCCESS_VALUE = 10;
const WARNING_VALUE = 11;
const DANGER_VALUE = 12;

const ChangingCategoryRow = ({ category, dateInfo }) => {
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [editCategoryClicked, setEditCategoryClicked] = useState(false);
  const subcategories = [...category.subcategories].sort(
    (a, b) => b.actual - a.actual
  );

  // Progess bar that shows how much was spent vs the budget set
  // Calculated by factors of 12 for the grid system
  let statusBarLength = Math.round((category.actual * 12) / category.budget);
  let percent = Math.round((category.actual / category.budget) * 100);

  // Show there's still a gap if the calculated statusBar is full but the actual is less than the budget value
  if (statusBarLength === 12 && category.actual < category.budget) {
    statusBarLength = 11;
  }

  // If a category was overspent on, just set the statusBar to the max value
  if (statusBarLength > 12) {
    statusBarLength = 12;
  }

  // Show there's some spending if the calculated statusBar is 0
  if (statusBarLength === 0 && category.actual > 0) {
    statusBarLength = 1;
    percent = 1;
  }

  // If the Fun Money category doesn't have money allocated to it, show the proper statusBar length based on the spending
  if (category.budget < 0) {
    if (category.actual > 0) {
      statusBarLength = 12;
      percent = Math.round(
        ((category.actual + category.budget * -1) / -category.budget) * 100
      );
    } else {
      statusBarLength = 0;
      percent = 0;
    }
  }

  const budgetBarLength = 12 - statusBarLength;

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
              subtractDecimalValues(category.budget, category.actual)
            )}
          </span>
        </td>
        <td className={progressColumn}>
          <div className="d-flex flex-row align-items-center text-white text-center">
            {statusBarLength === DANGER_VALUE && (
              <div
                className={`${
                  category.actual > category.budget ? "bg-danger" : "bg-warning"
                } col-${statusBarLength} rounded py-1 px-2 status-bar`}
              >
                {percent}%
              </div>
            )}
            {budgetBarLength === DANGER_VALUE && (
              <div
                className={`bg-dark col-${budgetBarLength} rounded py-1 px-2 status-bar ${
                  category.budget < 0 && "text-danger"
                }`}
              >
                {percent}%
              </div>
            )}
            {statusBarLength !== 0 && budgetBarLength !== 0 && (
              <>
                <div
                  className={`${
                    statusBarLength <= SUCCESS_VALUE && "bg-success"
                  }
                  ${statusBarLength === WARNING_VALUE && "bg-warning"}
                  ${
                    (statusBarLength === DANGER_VALUE ||
                      category.actual > category.budget) &&
                    "bg-danger"
                  }
                  col-${statusBarLength} border rounded-start py-1 px-2 status-bar`}
                >
                  {percent}%
                </div>
                <div
                  className={`bg-dark col-${budgetBarLength} border rounded-end status-bar`}
                />
              </>
            )}
          </div>
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
