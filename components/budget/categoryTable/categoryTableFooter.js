import PopUp from "@/components/layout/popUp";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import centsToDollars from "@/helpers/centsToDollars";
import { useContext } from "react";

const CategoryTableFooter = () => {
  const { categoryTotals } = useContext(CategoriesContext);

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
      <td className="col-3 col-md-2 cell">
        {centsToDollars(categoryTotals.budget)}
      </td>
      <td className="col-3 col-md-2 cell">
        {centsToDollars(categoryTotals.actual)}
      </td>
      <td
        className={`d-none d-md-block col-md-2 cell ${
          categoryTotals.remaining > 0 ? "text-white" : "text-danger fw-bold"
        }`}
      >
        {centsToDollars(categoryTotals.remaining)}
      </td>
      <td className="col-1" />
    </tr>
  );
};

export default CategoryTableFooter;
