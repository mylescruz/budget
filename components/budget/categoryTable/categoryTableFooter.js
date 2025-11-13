import PopUp from "@/components/layout/popUp";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { MonthIncomeContext } from "@/contexts/MonthIncomeContext";
import centsToDollars from "@/helpers/centsToDollars";
import { useContext, useEffect, useState } from "react";

const CategoryFooter = () => {
  const { categories } = useContext(CategoriesContext);
  const { monthIncome } = useContext(MonthIncomeContext);

  const [categoryTotals, setCategoryTotals] = useState(null);

  // Get the budget, actual value spent and the remaining value for each category
  useEffect(() => {
    if (categories && monthIncome) {
      const categoriesActual = categories.reduce(
        (sum, current) => sum + current.actual,
        0
      );

      setCategoryTotals({
        budget: monthIncome,
        actual: categoriesActual,
        remaining: monthIncome - categoriesActual,
      });
    }
  }, [categories, monthIncome]);

  return (
    <>
      {categoryTotals ? (
        <tr className="d-flex">
          <th className="col-5 cell">
            Total
            <PopUp
              title="Your budget is your total income for the month."
              id="budget-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
          <td className="col-3 col-md-2 cell">
            {centsToDollars(categoryTotals.budget)}
          </td>
          <td className="col-3 col-md-2 cell">
            {centsToDollars(categoryTotals.actual)}
          </td>
          <td
            className={`d-none d-md-block col-md-2 cell ${
              categoryTotals.remaining > 0
                ? "text-white"
                : "text-danger fw-bold"
            }`}
          >
            {centsToDollars(categoryTotals.remaining)}
          </td>
          <td className="col-1" />
        </tr>
      ) : (
        <tr>
          <td colSpan={1} className="text-danger fw-bold text-center">
            Error loading budget totals
          </td>
        </tr>
      )}
    </>
  );
};

export default CategoryFooter;
