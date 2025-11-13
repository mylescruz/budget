import PopUp from "@/components/layout/popUp";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { MonthIncomeContext } from "@/contexts/MonthIncomeContext";
import centsToDollars from "@/helpers/centsToDollars";
import { useContext, useEffect, useState } from "react";

const CategoryTableFooter = () => {
  const { categories, categoriesLoading } = useContext(CategoriesContext);
  const { monthIncome, monthIncomeLoading } = useContext(MonthIncomeContext);

  const budget = monthIncome;
  const actual = categories.reduce((sum, current) => sum + current.actual, 0);
  const remaining = budget - actual;

  return (
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
      <td className="col-3 col-md-2 cell">{centsToDollars(budget)}</td>
      <td className="col-3 col-md-2 cell">{centsToDollars(actual)}</td>
      <td
        className={`d-none d-md-block col-md-2 cell ${
          remaining > 0 ? "text-white" : "text-danger fw-bold"
        }`}
      >
        {centsToDollars(remaining)}
      </td>
      <td className="col-1" />
    </tr>
  );
};

export default CategoryTableFooter;
