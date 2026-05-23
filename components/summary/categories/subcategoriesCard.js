import dollarFormatter from "@/helpers/dollarFormatter";

const SubcategoriesSection = ({ subcategory }) => {
  const amount = subcategory.fixed ? subcategory.budget : subcategory.actual;

  const numMonths = `${subcategory.totalMonths} ${subcategory.totalMonths > 1 ? "months" : "month"}`;

  return (
    <div
      key={subcategory.name}
      className="d-flex justify-content-between py-1 small text-muted"
    >
      <div>
        <span>
          {subcategory.name}: {dollarFormatter(amount)} ({numMonths})
        </span>
      </div>
      <span>{dollarFormatter(amount / subcategory.totalMonths)} / month</span>
    </div>
  );
};

export default SubcategoriesSection;
