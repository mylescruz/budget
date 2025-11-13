import { useEffect, useState } from "react";

const useSummary = (year) => {
  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const getSummary = async () => {
      try {
        const response = await fetch(`/api/summary/${year}`);

        if (response.ok) {
          const fetchedSummary = await response.json();
          setSummary(fetchedSummary);
        } else {
          const message = await response.text();
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
  }, [year]);

  return { summary, summaryLoading };
};

export default useSummary;
