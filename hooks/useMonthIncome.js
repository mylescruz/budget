import { useEffect, useState } from "react";

// Fetches and returns the user's total income for a given month and year.
// Returns 0 if no income sources exist for the month.
//
// Return value:
// number  // total income in USD

const useMonthIncome = (month, year) => {
  const [monthIncome, setMonthIncome] = useState(null);
  const [monthIncomeRequest, setMonthIncomeRequest] = useState({
    action: "get", // get
    status: "loading", // loading | success | error
    message: "Getting your income for the month",
  });

  useEffect(() => {
    getMonthIncome();
  }, [month, year]);

  const getMonthIncome = async () => {
    try {
      const response = await fetch(`/api/monthIncome/${year}/${month}`);

      if (!response.ok) {
        const message = await response.text();

        throw new Error(message);
      }

      const fetchedIncome = await response.text();

      setMonthIncome(Number(fetchedIncome));

      setMonthIncomeRequest({
        action: "get",
        status: "success",
        message: null,
      });
    } catch (error) {
      console.error(error);

      setMonthIncomeRequest({
        action: "get",
        status: "error",
        message: error.message,
      });
    }
  };

  return { monthIncome, monthIncomeRequest };
};

export default useMonthIncome;
