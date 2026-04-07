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
  const [requestState, setRequestState] = useState({
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getBudgetMonths();
  }, []);

  const getBudgetMonths = useCallback(async () => {
    setBudgetMonthsLoading(true);
    setRequestState({
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

      setRequestState({ status: "success", message: null });
    } catch (error) {
      console.error(error);

      setRequestState({ status: "error", message: error.message });

      setBudgetMonths(null);
    } finally {
      setBudgetMonthsLoading(false);
    }
  }, []);

  return { budgetMonths, budgetMonthsLoading, requestState };
};

export default useBudgetMonths;
