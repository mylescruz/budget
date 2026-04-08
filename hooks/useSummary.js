import { useCallback, useEffect, useState } from "react";

const useSummary = (year) => {
  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryRequest, setSummaryRequest] = useState({
    action: null, //  get | null
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getSummary(year);
  }, [year]);

  const getSummary = useCallback(async (year) => {
    setSummaryLoading(true);
    setSummaryRequest({
      action: "get",
      status: "loading",
      message: `Getting your budget summary for ${year}`,
    });

    try {
      const response = await fetch(`/api/summary/${year}`);

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const fetchedSummary = await response.json();

      setSummary(fetchedSummary);

      setSummaryRequest({
        action: "get",
        status: "success",
        message: null,
      });
    } catch (error) {
      setSummaryRequest({
        action: "get",
        status: "error",
        message: error.message,
      });

      setSummary(null);
      console.error(error);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  return { summary, summaryLoading, summaryRequest };
};

export default useSummary;
