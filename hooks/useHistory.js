import { useEffect, useMemo, useState } from "react";

const useHistory = (year) => {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const getHistory = async () => {
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
    let actual = 0;
    let budget = 0;
    let leftover = 0;

    for (const month of history) {
      budget += month.budget;
      actual += month.actual;
      leftover += month.leftover;
    }

    return {
      budget: budget,
      actual: actual,
      leftover: leftover,
    };
  }, [history]);

  return { history, historyLoading, historyTotals };
};

export default useHistory;
