const WARNING_PERCENTAGE = 90;
const MAX_PERCENTAGE = 100;

const ProgressBar = ({ currentValue, totalValue, fixedCategory = false }) => {
  let percent = Math.round((currentValue / totalValue) * 100);

  // If the total value is negative, the percent should be above 100%
  if (totalValue < 0) {
    percent = Math.round(((currentValue - totalValue) / -totalValue) * 100);
  }

  // Adjust edge cases if the percent is 100 but the current value doesn't equal the total value
  if (percent === 100) {
    if (currentValue < totalValue) {
      percent = 99;
    } else {
      percent = 101;
    }
  }

  // If there's a small amount on a large total, still show there is progress
  if (percent === 0 && currentValue > 0) {
    percent = 1;
  }

  // Set the background color for the current value bar
  let currentBarColor;

  if (fixedCategory && percent !== 0) {
    // Always show a successful color with fixed categories
    currentBarColor = "bg-success";
  } else if (percent > MAX_PERCENTAGE) {
    // Show a danger color for overspending
    currentBarColor = "bg-danger";
  } else if (percent <= MAX_PERCENTAGE && percent >= WARNING_PERCENTAGE) {
    // Show a warning color if within 90% of your available funds
    currentBarColor = "bg-warning";
  } else if (percent === 0) {
    // Show nothing if there is no spending
    currentBarColor = "bg-dark";
  } else {
    currentBarColor = "bg-success";
  }

  // Show either a percentage or no budget if the percentage value is infinity
  const formattedPercent = percent !== Infinity ? percent : 100;

  const remainingPercent = 100 - formattedPercent;

  const percentText = percent !== Infinity ? `${percent}%` : "NO BUDGET";

  if (currentValue === 0 && totalValue === 0) {
    return (
      <div
        className={`rounded py-1 px-2 status-bar bg-dark text-white text-center fw-bold`}
        style={{ width: "100%" }}
      >
        NO BUDGET
      </div>
    );
  } else if (percent === 0 || percent === MAX_PERCENTAGE) {
    return (
      <div
        className={`rounded py-1 px-2 status-bar ${currentBarColor} text-white text-center fw-bold`}
        style={{ width: "100%" }}
      >
        {percentText}
      </div>
    );
  } else {
    return (
      <div className="w-100 d-flex flex-row align-items-center">
        <div
          className={`border rounded-start py-1 px-2 status-bar ${currentBarColor} text-white text-center fw-bold`}
          style={{ width: `${formattedPercent}%` }}
        >
          {percentText}
        </div>
        <div
          className={`border rounded-end status-bar bg-dark`}
          style={{ width: `${remainingPercent}%` }}
        />
      </div>
    );
  }
};

export default ProgressBar;
