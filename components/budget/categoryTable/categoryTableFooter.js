import PopUp from "@/components/layout/popUp";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import dollarFormatter from "@/helpers/dollarFormatter";
import { useContext } from "react";

const totalColumn = "col-6 col-md-4 col-lg-3 cell d-flex align-items-center";
const budgetColumn =
  "d-none col-lg-2 cell d-lg-flex align-items-center justify-content-end";
const spentColumn =
  "col-3 col-md-2 cell d-flex align-items-center justify-content-end";
const leftColumn =
  "col-3 col-md-2 cell d-flex align-items-center justify-content-end";
const progressColumn = "d-none d-md-block col-md-4 col-lg-3 fw-bold";

const CategoryTableFooter = () => {
  const { categoryTotals } = useContext(CategoriesContext);

  // Progress bar to show the percentage of total actual spent vs the income for the month
  let statusBarLength = Math.round(
    (categoryTotals.actual * 12) / categoryTotals.budget
  );

  if (categoryTotals.actual < categoryTotals.budget && statusBarLength === 12) {
    statusBarLength = 11;
  }

  if (statusBarLength > 12) {
    statusBarLength = 12;
  }

  if (categoryTotals.actual > 0 && statusBarLength <= 0) {
    statusBarLength = 12;
  }

  const budgetBarLength = 12 - statusBarLength;

  let percent = Math.round(
    (categoryTotals.actual / categoryTotals.budget) * 100
  );

  if (
    categoryTotals.actual > categoryTotals.budget &&
    categoryTotals.budget < 0
  ) {
    percent = Math.round(
      ((categoryTotals.actual + categoryTotals.budget * -1) /
        -categoryTotals.budget) *
        100
    );
  }

  return (
    <tr className="d-flex fw-bold">
      <th className={totalColumn}>
        Total
        <PopUp
          title="Your total income, total spent between fixed and changing categories and the remaining balance for the month."
          id="budget-info"
        >
          <span className="mx-1"> &#9432;</span>
        </PopUp>
      </th>
      <td className={budgetColumn}>{dollarFormatter(categoryTotals.budget)}</td>
      <td className={spentColumn}>{dollarFormatter(categoryTotals.actual)}</td>
      <td className={leftColumn}>
        <span
          className={`${
            categoryTotals.remaining > 0 ? "text-white" : "text-danger fw-bold"
          }`}
        >
          {dollarFormatter(categoryTotals.remaining)}
        </span>
      </td>
      <td className={progressColumn}>
        <div className="d-flex flex-row align-items-center text-white text-end">
          {statusBarLength === 12 && (
            <div
              className={`${
                categoryTotals.actual > categoryTotals.budget
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
                categoryTotals.budget < 0 && "text-danger"
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
                      categoryTotals.actual > categoryTotals.budget) &&
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
      </td>
    </tr>
  );
};

export default CategoryTableFooter;
