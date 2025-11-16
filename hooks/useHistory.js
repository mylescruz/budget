import { useEffect, useState } from "react";

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

  return { history, historyLoading };
};

export default useHistory;
