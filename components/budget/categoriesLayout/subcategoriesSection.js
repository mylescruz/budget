import dayFormatter from "@/helpers/dayFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import getDueDateDisplay from "@/helpers/getDueDateDisplay";

const SubcategoriesSection = ({ subcategory }) => {
  const dueInfo = getDueDateDisplay(subcategory);

  const amount = subcategory.fixed ? subcategory.budget : subcategory.actual;

  return (
    <div
      key={subcategory._id}
      className="d-flex justify-content-between py-1 small text-muted"
    >
      <div>
        <span>{subcategory.name} </span>
        {dueInfo && (
          <span className="mt-1 small text-muted">
            ({dueInfo.text} {dayFormatter(dueInfo.date)})
          </span>
        )}
      </div>
      <span>{dollarFormatter(amount)}</span>
    </div>
  );
};

export default SubcategoriesSection;
