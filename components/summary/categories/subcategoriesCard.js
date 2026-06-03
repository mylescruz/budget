import dollarFormatter from "@/helpers/dollarFormatter";

const SubcategoriesSection = ({ subcategory }) => {
  const amount = subcategory.fixed ? subcategory.budget : subcategory.actual;

  const numMonths = `${subcategory.totalMonths} ${subcategory.totalMonths > 1 ? "months" : "month"}`;

  return (
    <div
      key={subcategory.name}
      className="d-flex justify-content-between py-1 small"
    >
      <div>
        <span className="text-muted">
          {subcategory.name}:{" "}
          {dollarFormatter(amount / subcategory.totalMonths)} / month (
          {numMonths})
        </span>
      </div>
      <span className="text-dark fw-semibold">{dollarFormatter(amount)}</span>
    </div>
  );
};

export default SubcategoriesSection;
