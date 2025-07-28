import currencyFormatter from "@/helpers/currencyFormatter";

const SubcategoryRow = ({ subcategory }) => {
  return (
    <tr className="d-flex">
      <th className="col-6 cell text-end">{subcategory.name}</th>
      <td className="col-3 col-md-2"></td>
      <td className="col-3 col-md-2 text-end">
        {currencyFormatter.format(subcategory.actual)}
      </td>
      <td className="d-none d-md-block col-md-2"></td>
    </tr>
  );
};

export default SubcategoryRow;
