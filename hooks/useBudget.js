import { MONTHS } from "@/lib/constants/date";
import { useCallback, useEffect, useState } from "react";

const useBudget = (month, year) => {
  const [budget, setBudget] = useState({
    categories: null,
    transactions: null,
  });
  const [budgetRequest, setBudgetRequest] = useState({
    action: "get", // get
    status: "loading", // loading | success | error
    message: `Loading your budget for ${MONTHS[month]}/${year}`,
  });

  // Fetch a user's categories and transactions for the current month
  const getBudget = useCallback(async () => {
    setBudgetRequest({
      action: "get",
      status: "loading",
      message: `Loading your budget for ${MONTHS[month]}/${year}`,
    });

    try {
      const response = await fetch(`/api/budget/${year}/${month}`);

      if (!response.ok) {
        const message = await response.text();

        throw new Error(message);
      }

      const fetchedBudget = await response.json();

      setBudget({
        categories: fetchedBudget.categories,
        transactions: fetchedBudget.transactions,
      });

      setBudgetRequest({
        action: "get",
        status: "success",
        message: "Successfully loaded your budget",
      });
    } catch (error) {
      //   throw error;
      setBudgetRequest({
        action: "get",
        status: "error",
        message: error.message,
      });
    }
  }, [month, year]);

  useEffect(() => {
    getBudget();
  }, [getBudget]);

  return {
    categories: budget.categories,
    transactions: budget.transactions,
    budgetRequest,
  };
};

export default useBudget;
