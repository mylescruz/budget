import centsToDollars from "@/helpers/centsToDollars";

const SubcategoryRow = ({ subcategory }) => {
  return (
    <tr className="d-flex">
      <th className="col-5 cell text-end">{subcategory.name}</th>
      <td className="col-3 col-md-2"></td>
      <td className="col-3 col-md-2 text-end">
        {centsToDollars(subcategory.actual)}
      </td>
      <td className="d-none d-md-block col-md-2" />
      <td className="col-1" />
    </tr>
  );
};

export default SubcategoryRow;
