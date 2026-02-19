import { useState } from "react";
import dollarFormatter from "@/helpers/dollarFormatter";
import CategoryBadge from "@/components/category/categoryBadge";

const categoryColumn = "col-6 col-md-3";
const budgetColumn = "d-none d-md-block col-md-2 text-end";
const spentColumn = "col-3 col-md-2 text-end";
const leftColumn = "d-none d-md-block col-md-2 text-end";
const averageColumn = "col-3 col-md-2 text-end";
const monthsColumn = "d-none d-md-block col-md-1 text-end";

const CategorySummaryTableRow = ({ category }) => {
  const [showSubcategories, setShowSubcategories] = useState(false);

  const dropdownSubcategories = () => {
    setShowSubcategories(!showSubcategories);
  };

  return (
    <>
      <tr className="d-flex">
        <th className={categoryColumn}>
          <div className="d-flex align-items-center cell">
            <CategoryBadge name={category.name} color={category.color} />
            {category.subcategories.length > 0 && (
              <i
                className={`clicker mx-2 bi ${
                  showSubcategories ? "bi-chevron-up" : "bi-chevron-down"
                }`}
                onClick={dropdownSubcategories}
              />
            )}
          </div>
        </th>
        <td className={budgetColumn}>
          <span className={category.budget < 0 ? "text-danger" : ""}>
            {dollarFormatter(category.budget)}
          </span>
        </td>
        <td className={spentColumn}>{dollarFormatter(category.actual)}</td>
        <td className={leftColumn}>
          <span
            className={
              category.budget - category.actual < 0 ? "text-danger fw-bold" : ""
            }
          >
            {!category.fixed &&
              dollarFormatter(category.budget - category.actual)}
          </span>
        </td>
        <td className={averageColumn}>{dollarFormatter(category.average)}</td>
        <td className={monthsColumn}>{category.totalMonths}</td>
      </tr>
      {showSubcategories &&
        category.subcategories.map((subcategory) => (
          <tr key={subcategory.name} className="d-flex">
            <th className={categoryColumn}>
              <span className="mx-2">{subcategory.name}</span>
            </th>
            <td className={budgetColumn} />
            <td className={spentColumn}>
              {dollarFormatter(subcategory.actual)}
            </td>
            <td className={leftColumn} />
            <td className={averageColumn}>
              {dollarFormatter(subcategory.average)}
            </td>
            <td className={monthsColumn}>{subcategory.totalMonths}</td>
          </tr>
        ))}
    </>
  );
};

export default CategorySummaryTableRow;
