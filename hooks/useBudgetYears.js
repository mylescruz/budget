import { useCallback, useEffect, useState } from "react";

// Fetches each year a user has had a budget stored in the app
// GET response
/*
  {
    years: [year],
    current,
    max,
    min
  };
*/

const useBudgetYears = () => {
  const [budgetYears, setBudgetYears] = useState([]);
  const [budgetYearsLoading, setBudgetYearsLoading] = useState(true);
  const [budgetYearsReq, setBudgetYearsReq] = useState({
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getYears();
  }, []);

  const getYears = useCallback(async () => {
    setBudgetYearsReq({
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

      setBudgetYearsReq({
        status: "success",
        message: null,
      });
    } catch (error) {
      setBudgetYears(null);

      setBudgetYearsReq({
        status: "error",
        message: error.message,
      });
      console.error(error);
    } finally {
      setBudgetYearsLoading(false);
    }
  }, []);

  return { budgetYears, budgetYearsLoading, budgetYearsReq };
};

export default useBudgetYears;
