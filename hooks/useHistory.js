import { useEffect, useState } from "react";

const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // GET request that returns the user's history
  useEffect(() => {
    const getHistory = async () => {
      try {
        const rsp = await fetch("/api/history");

        if (rsp.ok) {
          const fetchedHistory = await rsp.json();
          setHistory(fetchedHistory);
        } else {
          const message = await rsp.text();
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
  }, []);

  return { history, historyLoading };
};

export default useHistory;
