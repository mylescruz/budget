import { useState } from "react";
import PopUp from "@/components/layout/popUp";
import centsToDollars from "@/helpers/centsToDollars";
import EditCategoryModal from "./editCategoryModal/editCategoryModal";
import ChangingSubcategoryRow from "./changingSubcategoryRow";

const ChangingCategoryRow = ({ category, dateInfo }) => {
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [editCategoryClicked, setEditCategoryClicked] = useState(false);
  const subcategories = [...category.subcategories].sort(
    (a, b) => b.actual - a.actual
  );

  let statusBarLength = Math.round((category.actual * 12) / category.budget);

  if (category.actual < category.budget && statusBarLength === 12) {
    statusBarLength = 11;
  }

  if (statusBarLength > 12) {
    statusBarLength = 12;
  }

  if (category.actual > 0 && statusBarLength <= 0) {
    statusBarLength = 12;
  }

  const budgetBarLength = 12 - statusBarLength;

  let percent = ((category.actual / category.budget) * 100).toFixed(0);

  if (category.actual > category.budget && category.budget < 0) {
    percent = (
      ((category.actual + category.budget * -1) / -category.budget) *
      100
    ).toFixed(0);
  }

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
        <th className="col-6 col-md-4 col-lg-3 d-flex justify-content-between">
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
        <td className="d-none d-lg-block col-lg-2 cell fw-bold">
          <span className={`${category.budget < 0 && "text-danger"}`}>
            {centsToDollars(category.budget)}
          </span>
        </td>
        <td className="col-3 col-md-2 cell">
          {centsToDollars(category.actual)}
        </td>
        <td className="col-3 col-md-2 cell">
          <span
            className={`${
              category.actual > category.budget && "text-danger fw-bold"
            }`}
          >
            {centsToDollars(category.budget - category.actual)}
          </span>
        </td>
        <td className="d-none d-md-block col-md-4 col-lg-3 fw-bold">
          {!category.fixed && (
            <div className="d-flex flex-row align-items-center text-white text-end">
              {statusBarLength === 12 && (
                <div
                  className={`${
                    category.actual > category.budget
                      ? "bg-danger"
                      : "bg-warning"
                  } col-${statusBarLength} rounded py-1 px-2 status-bar text-center`}
                >
                  {percent}%
                </div>
              )}
              {budgetBarLength === 12 && (
                <div
                  className={`bg-dark col-${budgetBarLength} rounded py-1 px-2 status-bar text-center ${
                    category.budget < 0 && "text-danger"
                  }`}
                >
                  {percent}%
                </div>
              )}
              {statusBarLength !== 0 && budgetBarLength !== 0 && (
                <>
                  <div
                    className={`${statusBarLength < 8 && "bg-success"}
                  ${
                    statusBarLength >= 8 &&
                    statusBarLength <= 11 &&
                    "bg-warning"
                  }
                  ${
                    (statusBarLength === 12 ||
                      category.actual > category.budget) &&
                    "bg-danger"
                  }
                  col-${statusBarLength} border rounded-start py-1 px-2 status-bar text-center`}
                  >
                    {percent}%
                  </div>
                  <div
                    className={`bg-dark col-${budgetBarLength} border rounded-end status-bar`}
                  />
                </>
              )}
            </div>
          )}
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
