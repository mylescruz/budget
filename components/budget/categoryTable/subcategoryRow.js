import centsToDollars from "@/helpers/centsToDollars";

const SubcategoryRow = ({ subcategory, category }) => {
  return (
    <tr className="d-flex">
      <th className="col-5 cell">
        <span className="mx-2">{subcategory.name}</span>
      </th>
      <td className="col-3 col-md-2">
        <span className="mx-3">
          {category.fixed && centsToDollars(subcategory.actual)}
        </span>
      </td>
      <td className="col-3 col-md-2">
        <span className="mx-3">
          {!category.fixed && centsToDollars(subcategory.actual)}
        </span>
      </td>
      <td className="d-none d-md-block col-md-2" />
      <td className="col-1" />
    </tr>
  );
};

export default SubcategoryRow;
