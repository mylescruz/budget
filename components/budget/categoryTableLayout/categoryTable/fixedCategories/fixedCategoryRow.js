import { useState } from "react";
import todayInfo from "@/helpers/todayInfo";
import dollarFormatter from "@/helpers/dollarFormatter";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import dayFormatter from "@/helpers/dayFormatter";
import ProgressBar from "@/components/layout/progressBar";
import FixedSubcategoryRow from "./fixedSubcategoryRow";
import CategoryBadge from "@/components/category/categoryBadge";

const FixedCategoryRow = ({
  category,
  dateInfo,
  setEditedCategory,
  setModal,
}) => {
  const [showSubcategories, setShowSubcategories] = useState(false);
  const subcategories = [...category.subcategories].sort(
    (a, b) => a.dueDate - b.dueDate,
  );

  // Find the actual value currently charged to the user based on the current date and the category's charge date
  let currentActual = 0;

  // Automatically assign the total actual if not in the current month's budget
  if (dateInfo.month !== todayInfo.month || dateInfo.year !== todayInfo.year) {
    currentActual = dollarsToCents(category.actual);
  } else {
    // Get the current charges for fixed expenses based on the day of the month
    if (category.dueDate) {
      const categoryDate = new Date(
        `${dateInfo.month}/${category.dueDate}/${dateInfo.year}`,
      );

      const categoryISODate = categoryDate.toISOString().split("T")[0];

      if (categoryISODate <= todayInfo.date) {
        currentActual = dollarsToCents(category.actual);
      }
    } else {
      if (category.subcategories.length === 0) {
        // If no dueDate field, automatically charge the category's whole actual value
        currentActual = dollarsToCents(category.actual);
      } else {
        for (const subcategory of category.subcategories) {
          if (subcategory.dueDate) {
            const subcategoryDate = new Date(
              `${dateInfo.month}/${subcategory.dueDate}/${dateInfo.year}`,
            );

            const subcategoryISODate = subcategoryDate
              .toISOString()
              .split("T")[0];

            if (subcategoryISODate <= todayInfo.date) {
              currentActual += dollarsToCents(subcategory.actual);
            }
          } else {
            // If no dueDate field, automatically charge the subcategory's actual value
            currentActual += dollarsToCents(subcategory.actual);
          }
        }
      }
    }
  }

  const categoryActual = centsToDollars(currentActual);

  const dropdownSubcategories = () => {
    setShowSubcategories(!showSubcategories);
  };

  const openEditModal = () => {
    setEditedCategory({ ...category, currentName: category.name });

    setModal("edit");
  };

  return (
    <>
      <tr className="d-flex">
        <th className="col-6 col-md-4 col-lg-3">
          <div className=" d-flex justify-content-between">
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
            <p className="mx-2 my-0 clicker" onClick={openEditModal}>
              &#8942;
            </p>
          </div>
        </th>
        <td className="col-3 col-md-2 d-lg-none text-end">
          {dollarFormatter(categoryActual)}
        </td>
        <td className="col-3 col-md-2 cell text-end fw-bold">
          {dollarFormatter(category.budget)}
        </td>
        <td className="d-none d-lg-block col-lg-2 text-end">
          {dollarFormatter(categoryActual)}
        </td>
        <td className="d-none d-lg-block col-lg-2 text-end">
          {dayFormatter(category.dueDate)}
        </td>
        <td className="d-none d-md-block col-md-4 col-lg-3 fw-bold">
          <ProgressBar
            actualValue={categoryActual}
            budgetValue={category.budget}
            fixedCategory={category.fixed}
          />
        </td>
      </tr>
      {showSubcategories &&
        subcategories.map((subcategory) => (
          <FixedSubcategoryRow key={subcategory.id} subcategory={subcategory} />
        ))}
    </>
  );
};

export default FixedCategoryRow;
