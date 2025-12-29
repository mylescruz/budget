import dollarFormatter from "@/helpers/dollarFormatter";

const ChangingSubcategoryRow = ({ subcategory }) => {
  return (
    <tr className="d-flex">
      <th className="col-6 col-md-4 col-lg-3 cell">
        <span className="mx-2">{subcategory.name}</span>
      </th>
      <td className="d-none d-lg-block col-lg-2"></td>
      <td className="col-6 col-md-8 col-lg-7">
        <span className="mx-3">{dollarFormatter(subcategory.actual)}</span>
      </td>
    </tr>
  );
};

export default ChangingSubcategoryRow;
