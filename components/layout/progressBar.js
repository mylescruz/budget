const MIN_VALUE = 0;
const SAFE_LIMIT = 10;
const WARNING_LIMIT = 11;
const MAX_VALUE = 12;

const ProgressBar = ({ actualValue, budgetValue, fixedCategory }) => {
  let percentSpent = Math.round((actualValue / budgetValue) * 100);

  // Get the length of the bar that shows how much was spent
  let actualBarLength = Math.round((actualValue * 12) / budgetValue);

  // If the Fun Money category has a negative budget, the percentSpent should be above 100%
  if (budgetValue < 0) {
    percentSpent = Math.round(
      ((actualValue - budgetValue) / -budgetValue) * 100,
    );

    actualBarLength = 12;
  }

  // Don't mark the bar as full if there is still a remaining balance in the budget
  if (actualBarLength === 12 && actualValue < budgetValue) {
    actualBarLength = 11;
  }

  // Keep any overspending set to the full amount
  if (actualBarLength > 12) {
    actualBarLength = 12;
  }

  // If there's a small amount spent on a large budget, still show something was spent
  if (actualValue > 0 && actualBarLength <= 0) {
    percentSpent = 1;
    actualBarLength = 1;
  }

  // Set the background color for the actual bar based on its length
  let actualBarColor;

  if (actualBarLength === MIN_VALUE) {
    actualBarColor = "bg-dark";
  } else if (actualBarLength <= SAFE_LIMIT) {
    actualBarColor = "bg-success";
  } else if (actualBarLength === WARNING_LIMIT) {
    actualBarColor = "bg-warning";
  } else {
    actualBarColor = "bg-danger";
  }

  // Always show a successful color with fixed categories
  if (fixedCategory) {
    actualBarColor = "bg-success";
  }

  // Show either a percentage or no budget if the percentage value is infinity
  const formattedPercent =
    percentSpent !== Infinity ? `${percentSpent}%` : "NO BUDGET";

  const remainingBarLength = 12 - actualBarLength;

  if (actualValue === MIN_VALUE && budgetValue === MIN_VALUE) {
    return (
      <div
        className={`col-12 rounded py-1 px-2 status-bar ${actualBarColor} text-white text-center`}
      >
        NO BUDGET
      </div>
    );
  } else if (actualBarLength === MAX_VALUE) {
    return (
      <div
        className={`col-12 rounded py-1 px-2 status-bar ${actualBarColor} text-white text-center`}
      >
        {formattedPercent}
      </div>
    );
  } else if (actualBarLength === MIN_VALUE) {
    return (
      <div
        className={`col-12 rounded py-1 px-2 status-bar ${actualBarColor} text-white text-center`}
      >
        {formattedPercent}
      </div>
    );
  } else {
    return (
      <div className="d-flex flex-row align-items-center">
        <div
          className={`col-${actualBarLength} border rounded-start py-1 px-2 status-bar ${actualBarColor} text-white text-center`}
        >
          {formattedPercent}
        </div>
        <div
          className={`col-${remainingBarLength} border rounded-end status-bar bg-dark`}
        />
      </div>
    );
  }
};

export default ProgressBar;
