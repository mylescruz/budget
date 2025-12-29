import dollarFormatter from "@/helpers/dollarFormatter";

const FixedSubcategoryRow = ({ subcategory }) => {
  return (
    <tr className="d-flex">
      <th className="col-6 col-md-4 col-lg-3 cell">
        <span className="mx-2">{subcategory.name}</span>
      </th>
      <td className="col-6 col-md-2 fw-bold">
        <span className="mx-3">{dollarFormatter(subcategory.actual)}</span>
      </td>
      <td className="d-none d-md-block col-md-4">{subcategory.dayOfMonth}</td>
      <td className="d-none d-md-block col-md-4 col-lg-3" />
    </tr>
  );
};

export default FixedSubcategoryRow;
