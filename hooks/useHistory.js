import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import { useEffect, useMemo, useState } from "react";

const useHistory = (year) => {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const getHistory = async () => {
      setHistoryLoading(true);

      try {
        const response = await fetch(`/api/history/${year}`);

        if (response.ok) {
          const fetchedHistory = await response.json();
          setHistory(fetchedHistory);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        setHistory(null);
        console.error(error);
      } finally {
        setHistoryLoading(false);
      }
    };

    getHistory();
  }, [year]);

  const historyTotals = useMemo(() => {
    let totalBudget = 0;
    let totalActual = 0;

    for (const month of history) {
      totalBudget += dollarsToCents(month.budget);
      totalActual += dollarsToCents(month.actual);
    }

    return {
      budget: centsToDollars(totalBudget),
      actual: centsToDollars(totalActual),
      leftover: centsToDollars(totalBudget - totalActual),
    };
  }, [history]);

  return { history, historyLoading, historyTotals };
};

export default useHistory;
