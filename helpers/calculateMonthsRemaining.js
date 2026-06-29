export default function calculateMonthsRemaining(balance, apr, monthlyPayment) {
  let months = 0;

  // No interest
  if (apr === 0) {
    months = Math.ceil(balance / monthlyPayment);
  } else {
    const monthlyRate = apr / 100 / 12;

    // If payment is too small to ever pay off debt
    if (monthlyPayment <= balance * monthlyRate) {
      return "Not Possible";
    }

    months = Math.ceil(
      -Math.log(1 - (balance * monthlyRate) / monthlyPayment) /
        Math.log(1 + monthlyRate),
    );
  }

  if (months < 12) {
    return `${months} months`;
  } else {
    const years = Math.ceil(months / 12);
    const monthsRemainder = months % 12;

    return `${years} year${years > 1 ? "s" : ""} ${monthsRemainder} month${monthsRemainder > 1 ? "s" : ""}`;
  }
}
