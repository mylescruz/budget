import PopUp from "@/components/layout/popUp";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import centsToDollars from "@/helpers/centsToDollars";
import { useContext } from "react";

const CategoryTableFooter = () => {
  const { categoryTotals } = useContext(CategoriesContext);

  return (
    <tr className="d-flex fw-bold">
      <th className="col-6 col-md-4 col-lg-3 cell">
        Total
        <PopUp
          title="Your total budget is your total net income for the month."
          id="budget-info"
        >
          <span> &#9432;</span>
        </PopUp>
      </th>
      <td className="d-none d-lg-block col-lg-2 cell">
        {centsToDollars(categoryTotals.budget)}
      </td>
      <td className="col-3 col-md-2 cell">
        {centsToDollars(categoryTotals.actual)}
      </td>
      <td
        className={`col-3 col-md-2 cell ${
          categoryTotals.remaining > 0 ? "text-white" : "text-danger fw-bold"
        }`}
      >
        {centsToDollars(categoryTotals.remaining)}
      </td>
      <td className="d-none d-md-block col-md-4 col-lg-3" />
    </tr>
  );
};

export default CategoryTableFooter;
