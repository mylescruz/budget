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
  const [budgetYearsRequest, setBudgetYearsRequest] = useState({
    action: null, //  get | create | update | delete | null
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getYears();
  }, []);

  const getYears = useCallback(async () => {
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
  }, []);

  return { budgetYears, budgetYearsLoading, budgetYearsRequest };
};

export default useBudgetYears;
