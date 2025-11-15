import { useEffect, useState } from "react";

const useBudgetYears = () => {
  const [budgetYears, setBudgetYears] = useState([]);
  const [budgetYearsLoading, setBudgetYearsLoading] = useState(true);

  useEffect(() => {
    const getYears = async () => {
      try {
        const response = await fetch("api/budgetYears");

        if (response.ok) {
          const fetchedYears = await response.json();

          setBudgetYears(fetchedYears);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        setBudgetYears(null);
        console.error(error);
      } finally {
        setBudgetYearsLoading(false);
      }
    };

    getYears();
  }, []);

  return { budgetYears, budgetYearsLoading };
};

export default useBudgetYears;
