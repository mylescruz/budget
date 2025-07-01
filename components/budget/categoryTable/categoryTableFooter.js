import PopUp from "@/components/layout/popUp";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import currencyFormatter from "@/helpers/currencyFormatter";
import { useContext, useEffect, useState } from "react";

const CategoryFooter = ({ getMonthIncome, monthInfo }) => {
  const { categories } = useContext(CategoriesContext);
  const [footerValues, setFooterValue] = useState({
    budget: 0,
    actual: 0,
    difference: 0,
  });

  // Get the budget, actual value spent and the remaining value for each category
  useEffect(() => {
    if (categories) {
      let actualValue = 0;

      categories.forEach((category) => {
        actualValue += category.actual;
      });

      const budget = getMonthIncome(monthInfo);

      setFooterValue({
        budget: budget,
        actual: actualValue,
        difference: budget - actualValue,
      });
    }
  }, [categories, getMonthIncome, monthInfo]);

  return (
    <>
      {footerValues ? (
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
          <td className="d-none d-md-block col-md-2 cell">
            {currencyFormatter.format(footerValues.budget)}
          </td>
          <td className="col-3 col-md-2 cell">
            {currencyFormatter.format(footerValues.actual)}
          </td>
          <td
            className={`col-3 col-md-2 cell ${footerValues.difference > 0 ? "text-white" : "text-danger fw-bold"}`}
          >
            {currencyFormatter.format(footerValues.difference)}
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
