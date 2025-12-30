import dollarFormatter from "@/helpers/dollarFormatter";

const categoryColumn = "col-6 col-md-4 col-lg-3 cell";
const budgetColumn = "d-none d-lg-block col-lg-2";
const spentColumn = "col-3 col-md-2 text-end";
const leftColumn = "col-3 col-md-2";
const progressColumn = "d-none d-md-block col-md-4 col-lg-3";

const ChangingSubcategoryRow = ({ subcategory }) => {
  return (
    <tr className="d-flex">
      <th className={categoryColumn}>
        <span className="mx-2">{subcategory.name}</span>
      </th>
      <td className={budgetColumn} />
      <td className={spentColumn}>{dollarFormatter(subcategory.actual)}</td>
      <td className={leftColumn} />
      <td className={progressColumn} />
    </tr>
  );
};

export default ChangingSubcategoryRow;
