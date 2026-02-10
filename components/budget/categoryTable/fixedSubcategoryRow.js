import dayFormatter from "@/helpers/dayFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";

const FixedSubcategoryRow = ({ subcategory }) => {
  return (
    <tr className="d-flex">
      <th className="col-6 col-md-4 col-lg-3 cell">
        <span className="mx-2">{subcategory.name}</span>
      </th>
      <td className="col-3 col-md-2 d-lg-none text-end" />
      <td className="col-3 col-md-2 col-lg-2 text-end fw-bold">
        {dollarFormatter(subcategory.actual)}
      </td>
      <td className="d-none d-lg-block col-lg-4 text-end">
        {dayFormatter(subcategory.dueDate)}
      </td>
      <td className="d-none d-md-block col-md-4 col-lg-3 fw-bold" />
    </tr>
  );
};

export default FixedSubcategoryRow;
