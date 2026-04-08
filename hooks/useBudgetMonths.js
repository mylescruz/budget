import { useCallback, useEffect, useState } from "react";

// Fetches each month a user has had a budget stored in the app
// GET response
/*
  {
    months: [{ month, year }],
    current: { month, year },
    max: { month, year },
    min: { month, year },
  };
*/

const useBudgetMonths = () => {
  const [budgetMonths, setBudgetMonths] = useState([]);
  const [budgetMonthsLoading, setBudgetMonthsLoading] = useState(true);
  const [budgetMonthsReq, setBudgetMonthsReq] = useState({
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getBudgetMonths();
  }, []);

  const getBudgetMonths = useCallback(async () => {
    setBudgetMonthsLoading(true);
    setBudgetMonthsReq({
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

      setBudgetMonthsReq({ status: "success", message: null });
    } catch (error) {
      console.error(error);

      setBudgetMonthsReq({ status: "error", message: error.message });

      setBudgetMonths(null);
    } finally {
      setBudgetMonthsLoading(false);
    }
  }, []);

  return { budgetMonths, budgetMonthsLoading, budgetMonthsReq };
};

export default useBudgetMonths;
