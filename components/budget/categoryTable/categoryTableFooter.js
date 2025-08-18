import PopUp from "@/components/layout/popUp";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { PaychecksContext } from "@/contexts/PaychecksContext";
import currencyFormatter from "@/helpers/currencyFormatter";
import { useContext, useEffect, useState } from "react";

const CategoryFooter = ({ monthInfo }) => {
  const { categories } = useContext(CategoriesContext);
  const { getMonthIncome } = useContext(PaychecksContext);
  const [categoryTotals, setCategoryTotals] = useState({
    budget: 0,
    actual: 0,
    remaining: 0,
  });

  // Get the budget, actual value spent and the remaining value for each category
  useEffect(() => {
    if (categories) {
      let totalActual = 0;

      categories.forEach((category) => {
        totalActual += category.actual;
      });

      const budget = getMonthIncome(monthInfo);

      if (budget !== null) {
        setCategoryTotals({
          budget: budget,
          actual: totalActual,
          remaining: budget - totalActual,
        });
      } else {
        setCategoryTotals(null);
      }
    }
  }, [categories, getMonthIncome, monthInfo]);

  return (
    <>
      {categoryTotals ? (
        <tr className="d-flex">
          <th className="col-6 cell">
            Total
            <PopUp
              title="Your budget is your total income for the month."
              id="budget-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
          <td className="col-3 col-md-2 cell">
            {currencyFormatter.format(categoryTotals.budget)}
          </td>
          <td className="col-3 col-md-2 cell">
            {currencyFormatter.format(categoryTotals.actual)}
          </td>
          <td
            className={`d-none d-md-block col-md-2 cell ${
              categoryTotals.remaining > 0
                ? "text-white"
                : "text-danger fw-bold"
            }`}
          >
            {currencyFormatter.format(categoryTotals.remaining)}
          </td>
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
