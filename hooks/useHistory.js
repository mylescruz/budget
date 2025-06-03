import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const useHistory = (username) => {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const router = useRouter();

  // GET request that returns the user's history based on the username
  useEffect(() => {
    const getHistory = async () => {
      try {
        const rsp = await fetch(`/api/history/${username}`);

        if (rsp.ok) {
          const result = await rsp.json();
          setHistory(result);
          setHistoryLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        router.push({
          pathname: "/error",
          query: { message: error.message },
        });
      }
    };

    getHistory();
  }, [username, router]);

  const redirectToErrorPage = useCallback(
    (error) => {
      router.push({
        pathname: "/error",
        query: { message: error.message },
      });
    },
    [router]
  );

  // POST request that adds a month to the user's history based on the username
  // Then it sets the history array to the array returned by the response
  const postHistory = useCallback(
    async (newHistory) => {
      try {
        const rsp = await fetch(`/api/history/${username}`, {
          method: "POST",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newHistory),
        });

        if (rsp.ok) {
          const result = await rsp.json();
          setHistory(result);
          setHistoryLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [username, redirectToErrorPage]
  );

  // PUT request that updates a month's values in the user's history based on the username
  // Then it sets the history array to the array returned by the response
  const putHistory = useCallback(
    async (edittedHistory) => {
      try {
        const rsp = await fetch(`/api/history/${username}`, {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(edittedHistory),
        });

        if (rsp.ok) {
          const result = await rsp.json();
          setHistory(result);
          setHistoryLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [username, redirectToErrorPage]
  );

  // Function that returns a user's history for a single month based on the given month and year
  const getMonthHistory = useCallback(
    (monthInfo) => {
      const foundMonth = history.find((currentMonth) => {
        return (
          currentMonth.month === monthInfo.month &&
          currentMonth.year === monthInfo.year
        );
      });

      if (foundMonth) {
        return { ...foundMonth };
      } else {
        return undefined;
      }
    },
    [history]
  );

  return { history, historyLoading, postHistory, putHistory, getMonthHistory };
};

export default useHistory;
