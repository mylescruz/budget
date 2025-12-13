import { useState } from "react";
import centsToDollars from "@/helpers/centsToDollars";
import EditCategoryModal from "./editCategoryModal/editCategoryModal";
import FixedSubcategoryRow from "./fixedSubcategoryRow";
import todayInfo from "@/helpers/todayInfo";

const FixedCategoryRow = ({ category, dateInfo }) => {
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [editCategoryClicked, setEditCategoryClicked] = useState(false);
  const subcategories = [...category.subcategories].sort(
    (a, b) => a.dayOfMonth - b.dayOfMonth
  );

  let currentActual = 0;

  if (category.dayOfMonth) {
    const categoryDate = new Date(
      `${dateInfo.month}/${category.dayOfMonth}/${dateInfo.year}`
    );
    const isoDate = categoryDate.toISOString().split("T")[0];
    if (isoDate <= dateInfo.date) {
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

  let statusBarLength = Math.round((currentActual * 12) / category.budget);

  if (category.actual < category.budget && statusBarLength === 12) {
    statusBarLength = 11;
  }

  if (category.actual > 0 && statusBarLength === 0) {
    statusBarLength = 1;
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
        <th className="col-6 col-md-4 col-lg-3">
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
        <td className="col-3 col-md-2 cell fw-bold">
          {centsToDollars(category.budget)}
        </td>
        <td className="d-none d-lg-block col-lg-2">{category.dayOfMonth}</td>
        <td className="col-3 col-md-2 col-lg-2">
          {centsToDollars(currentActual)}
        </td>
        <td className="d-none d-md-block col-md-4 col-lg-3 fw-bold">
          <div className="d-flex flex-row align-items-center text-white text-end">
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
