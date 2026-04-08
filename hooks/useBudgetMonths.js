import { useCallback, useEffect, useState } from "react";

// Fetches and returns all months in which the user has stored budgets.
// Also provides the current month and the range of available months.
//
// Return value:
// {
//   months: { month: number, year: number }[], // all available budget months
//   current: { month: number, year: number },  // active/selected month
//   min: { month: number, year: number },      // earliest available month
//   max: { month: number, year: number }       // latest available month
// }

const useBudgetMonths = () => {
  const [budgetMonths, setBudgetMonths] = useState([]);
  const [budgetMonthsLoading, setBudgetMonthsLoading] = useState(true);
  const [budgetMonthsRequest, setBudgetMonthsRequest] = useState({
    action: null, //  get | create | update | delete | null
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getBudgetMonths();
  }, []);

  const getBudgetMonths = useCallback(async () => {
    setBudgetMonthsLoading(true);
    setBudgetMonthsRequest({
      action: "get",
      status: "loading",
      message: "Getting your budget months",
    });

    try {
      const response = await fetch("/api/budgetMonths");

      if (!response.ok) {
        const errorMessage = await response.text();

        throw new Error(errorMessage);
      }

      const fetchedMonths = await response.json();

      setBudgetMonths(fetchedMonths);

      setBudgetMonthsRequest({
        action: "get",
        status: "success",
        message: null,
      });
    } catch (error) {
      console.error(error);

      setBudgetMonthsRequest({
        action: "get",
        status: "error",
        message: error.message,
      });

      setBudgetMonths(null);
    } finally {
      setBudgetMonthsLoading(false);
    }
  }, []);

  return { budgetMonths, budgetMonthsLoading, budgetMonthsRequest };
};

export default useBudgetMonths;
