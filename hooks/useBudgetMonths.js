import { useEffect, useState } from "react";

const useBudgetMonths = () => {
  const [budgetMonths, setBudgetMonths] = useState([]);
  const [budgetMonthsLoading, setBudgetMonthsLoading] = useState(true);

  useEffect(() => {
    const getBudgetMonths = async () => {
      setBudgetMonthsLoading(true);

      try {
        const response = await fetch("/api/budgetMonths");

        if (response.ok) {
          const fetchedMonths = await response.json();

          setBudgetMonths(fetchedMonths);
        } else {
          const errorMessage = await response.text();

          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error(error);
        setBudgetMonths(null);
      } finally {
        setBudgetMonthsLoading(false);
      }
    };

    getBudgetMonths();
  }, []);

  return { budgetMonths, budgetMonthsLoading };
};

export default useBudgetMonths;
