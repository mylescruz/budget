import { useEffect, useState } from "react";

const useSummary = (username, year) => {
  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const getSummary = async () => {
      try {
        const rsp = await fetch(`/api/summary/${username}/${year}`);

        if (rsp.ok) {
          const fetchedSummary = await rsp.json();
          setSummary(fetchedSummary);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        setSummary(null);
        console.error(error);
      } finally {
        setSummaryLoading(false);
      }
    };

    getSummary();
  }, [username, year]);

  return { summary, summaryLoading };
};

export default useSummary;
