import PopUp from "@/components/layout/popUp";
import currencyFormatter from "@/helpers/currencyFormatter";

const CategoryFooter = ({ footerValues }) => {
  let totalDifference = 0;

  if (footerValues) {
    totalDifference = (footerValues.budget - footerValues.actual).toFixed(2);
  }

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
            className={`col-3 col-md-2 cell ${totalDifference > 0 ? "text-white" : "text-danger fw-bold"}`}
          >
            {currencyFormatter.format(totalDifference)}
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
