import dollarFormatter from "@/helpers/dollarFormatter";

const categoryColumn = "col-6 col-md-4 col-lg-3 cell";
const amountColumn = "col-3 col-md-2 fw-bold text-end";
const dayColumn = "d-none d-lg-block col-lg-2 text-end";
const chargedColumn = "col-3 col-md-2 col-lg-2";
const progressColumn = "d-none d-md-block col-md-4 col-lg-3 fw-bold";

const FixedSubcategoryRow = ({ subcategory }) => {
  return (
    <tr className="d-flex">
      <th className={categoryColumn}>
        <span className="mx-2">{subcategory.name}</span>
      </th>
      <td className={amountColumn}>{dollarFormatter(subcategory.actual)}</td>
      <td className={chargedColumn} />
      <td className={dayColumn}>{subcategory.dayOfMonth}</td>
      <td className={progressColumn} />
    </tr>
  );
};

export default FixedSubcategoryRow;
