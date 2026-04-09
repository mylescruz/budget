import { useEffect, useState } from "react";

// Fetches and returns all budget years associated with the user.
// Also provides the current year and the range of available years.
//
// Return value:
// {
//   years: number[],   // all years with stored budgets
//   current: number,   // currently selected or active year
//   min: number,       // earliest available year
//   max: number        // latest available year
// }

const useBudgetYears = () => {
  const [budgetYears, setBudgetYears] = useState([]);
  const [budgetYearsLoading, setBudgetYearsLoading] = useState(true);
  const [budgetYearsRequest, setBudgetYearsRequest] = useState({
    action: null, // get | null
    status: "loading", // loading | success | error
    message: null,
  });

  useEffect(() => {
    getYears();
  }, []);

  const getYears = async () => {
    setBudgetYearsRequest({
      action: "get",
      status: "loading",
      message: "Getting the years in your budget",
    });

    try {
      const response = await fetch("api/budgetYears");

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const fetchedYears = await response.json();

      setBudgetYears(fetchedYears);

      setBudgetYearsRequest({
        action: "get",
        status: "success",
        message: null,
      });
    } catch (error) {
      setBudgetYears(null);

      setBudgetYearsRequest({
        action: "get",
        status: "error",
        message: error.message,
      });
      console.error(error);
    } finally {
      setBudgetYearsLoading(false);
    }
  };

  return { budgetYears, budgetYearsLoading, budgetYearsRequest };
};

export default useBudgetYears;
