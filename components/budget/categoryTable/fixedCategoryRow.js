import { useState } from "react";
import EditCategoryModal from "./editCategoryModal/editCategoryModal";
import FixedSubcategoryRow from "./fixedSubcategoryRow";
import todayInfo from "@/helpers/todayInfo";
import dollarFormatter from "@/helpers/dollarFormatter";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import dayFormatter from "@/helpers/dayFormatter";

const FixedCategoryRow = ({ category, dateInfo }) => {
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [editCategoryClicked, setEditCategoryClicked] = useState(false);
  const subcategories = [...category.subcategories].sort(
    (a, b) => a.dueDate - b.dueDate,
  );

  // Find the actual value currently charged to the user based on the current date and the category's charge date
  let currentActual = 0;

  // Automatically assign the total actual if not in the current month's budget
  if (dateInfo.month !== todayInfo.month || dateInfo.year !== todayInfo.year) {
    currentActual = dollarsToCents(category.actual);
  } else {
    // Get the current charges for fixed expenses based on the day of the month
    if (category.dueDate) {
      const categoryDate = new Date(
        `${dateInfo.month}/${category.dueDate}/${dateInfo.year}`,
      );

      const categoryISODate = categoryDate.toISOString().split("T")[0];

      if (categoryISODate <= todayInfo.date) {
        currentActual = dollarsToCents(category.actual);
      }
    } else {
      if (category.subcategories.length === 0) {
        // If no dueDate field, automatically charge the category's whole actual value
        currentActual = dollarsToCents(category.actual);
      } else {
        for (const subcategory of category.subcategories) {
          if (subcategory.dueDate) {
            const subcategoryDate = new Date(
              `${dateInfo.month}/${subcategory.dueDate}/${dateInfo.year}`,
            );

            const subcategoryISODate = subcategoryDate
              .toISOString()
              .split("T")[0];

            if (subcategoryISODate <= todayInfo.date) {
              currentActual += dollarsToCents(subcategory.actual);
            }
          } else {
            // If no dueDate field, automatically charge the subcategory's actual value
            currentActual += dollarsToCents(subcategory.actual);
          }
        }
      }
    }
  }

  const categoryActual = centsToDollars(currentActual);

  // Progress bar that shows the charge percentage for the month
  // Calculated by factors of 12 for the grid system
  let statusBarLength = Math.round((categoryActual * 12) / category.budget);
  let percent = Math.round((categoryActual / category.budget) * 100);

  // Show there's still a gap if the calculated statusBar is full but the actual is less than the budget value
  if (statusBarLength === 12 && categoryActual < category.budget) {
    statusBarLength = 11;

    if (percent === 100) {
      percent = 99;
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
        <td className="col-3 col-md-2 d-lg-none text-end">
          {dollarFormatter(categoryActual)}
        </td>
        <td className="col-3 col-md-2 cell text-end fw-bold">
          {dollarFormatter(category.budget)}
        </td>
        <td className="d-none d-lg-block col-lg-2 text-end">
          {dollarFormatter(categoryActual)}
        </td>
        <td className="d-none d-lg-block col-lg-2 text-end">
          {dayFormatter(category.dueDate)}
        </td>
        <td className="d-none d-md-block col-md-4 col-lg-3 fw-bold">
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
