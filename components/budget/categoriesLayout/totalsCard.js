import dollarFormatter from "@/helpers/dollarFormatter";

const TotalsCard = ({ budget, actual }) => {
  const remaining = budget - actual;

  return (
    <div className="bg-light rounded-3 p-3 mt-2">
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Total</span>
        <span>{dollarFormatter(actual)}</span>
      </div>

      <div className="d-flex justify-content-between text-muted small">
        <span>Budget</span>
        <span>{dollarFormatter(budget)}</span>
      </div>

      <div className="d-flex justify-content-between small">
        <span>Remaining</span>
        <span className={remaining < 0 ? "text-danger" : ""}>
          {dollarFormatter(remaining)}
        </span>
      </div>
    </div>
  );
};

export default TotalsCard;
