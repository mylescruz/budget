import { useState } from "react";
import EditCategoryModal from "./editCategoryModal/editCategoryModal";
import FixedSubcategoryRow from "./fixedSubcategoryRow";
import todayInfo from "@/helpers/todayInfo";
import dollarFormatter from "@/helpers/dollarFormatter";

const categoryColumn = "col-6 col-md-4 col-lg-3";
const amountColumn = "col-3 col-md-2 cell text-end fw-bold";
const dayColumn = "d-none d-lg-block col-lg-2 text-end";
const chargedColumn = "col-3 col-md-2 col-lg-2 text-end";
const progressColumn = "d-none d-md-block col-md-4 col-lg-3 fw-bold";

const FixedCategoryRow = ({ category, dateInfo }) => {
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [editCategoryClicked, setEditCategoryClicked] = useState(false);
  const subcategories = [...category.subcategories].sort(
    (a, b) => a.dayOfMonth - b.dayOfMonth
  );

  let currentActual = 0;

  // Get the current charges for fixed expenses based on the day of the month
  if (category.dayOfMonth) {
    const categoryDate = new Date(
      `${dateInfo.month}/${category.dayOfMonth}/${dateInfo.year}`
    );
    const isoDate = categoryDate.toISOString().split("T")[0];

    let comparisonDate = dateInfo.date;

    if (
      dateInfo.month !== todayInfo.month ||
      dateInfo.year !== todayInfo.year
    ) {
      comparisonDate = dateInfo.endOfMonth;
    }

    if (isoDate <= comparisonDate) {
      currentActual = category.actual;
    }
  } else {
    if (category.subcategories.length > 0) {
      for (const subcategory of category.subcategories) {
        if (subcategory.dayOfMonth) {
          const subcategoryDate = new Date(
            `${dateInfo.month}/${subcategory.dayOfMonth}/${dateInfo.year}`
          );

          const isoDate = subcategoryDate.toISOString().split("T")[0];

          let comparisonDate = dateInfo.date;

          if (
            dateInfo.month !== todayInfo.month ||
            dateInfo.year !== todayInfo.year
          ) {
            comparisonDate = dateInfo.endOfMonth;
          }

          if (isoDate <= comparisonDate) {
            currentActual += subcategory.actual;
          }
        } else {
          currentActual += subcategory.actual;
        }
      }
    } else {
      currentActual = category.actual;
    }
  }

  // Progress bar that shows the charge percentage for the month
  let statusBarLength = Math.round((currentActual * 12) / category.budget);

  if (category.actual < category.budget && statusBarLength === 12) {
    statusBarLength = 11;
  }

  const budgetBarLength = 12 - statusBarLength;

  const percent = Math.round((currentActual / category.budget) * 100);

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
          <div className=" d-flex justify-content-between">
            <div className="d-flex align-items-center cell">
              <span
                style={categoryColor}
                className="badge fw-bold fs-6 text-white"
              >
                {category.name.length > 15
                  ? category.name.slice(0, 15) + "..."
                  : category.name}
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
          </div>
        </th>
        <td className={amountColumn}>{dollarFormatter(category.budget)}</td>
        <td className={dayColumn}>{category.dayOfMonth}</td>
        <td className={chargedColumn}>{dollarFormatter(currentActual)}</td>
        <td className={progressColumn}>
          <div className="d-flex flex-row align-items-center text-white text-center">
            {statusBarLength === 12 && (
              <div
                className={`bg-success col-${statusBarLength} border rounded py-1 px-2 status-bar`}
              >
                {percent}%
              </div>
            )}
            {budgetBarLength === 12 && (
              <div
                className={`bg-dark col-${budgetBarLength} border rounded py-1 px-2 status-bar`}
              >
                {percent}%
              </div>
            )}
            {statusBarLength !== 0 && budgetBarLength !== 0 && (
              <>
                <div
                  className={`bg-success col-${statusBarLength} border rounded-start py-1 px-2 status-bar`}
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
          <FixedSubcategoryRow key={subcategory.id} subcategory={subcategory} />
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

export default FixedCategoryRow;
