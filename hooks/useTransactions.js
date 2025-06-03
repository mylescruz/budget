import dateSorter from "@/helpers/dateSorter";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const useTransactions = (username, month, year) => {
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const router = useRouter();

  // GET request that returns the user's transaction based on the username, year and month
  useEffect(() => {
    const getTransactions = async () => {
      try {
        const rsp = await fetch(
          `/api/transactions/${username}/${year}/${month}/transaction`
        );

        if (rsp.ok) {
          const result = await rsp.json();
          setTransactions(dateSorter(result));
          setTransactionsLoading(false);
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
    getTransactions();
  }, [username, month, year, router]);

  const redirectToErrorPage = useCallback(
    (error) => {
      router.push({
        pathname: "/error",
        query: { message: error.message },
      });
    },
    [router]
  );

  // POST request that adds a new transaction based on the username, year and month
  // Then it sets the transactions array to the array returned by the response
  const postTransaction = useCallback(
    async (newTransaction) => {
      const date = new Date(newTransaction.date);
      const month = date.toLocaleDateString("en-US", {
        month: "long",
        timeZone: "UTC",
      });

      try {
        const rsp = await fetch(
          `/api/transactions/${username}/${year}/${month}/transaction`,
          {
            method: "POST",
            headers: {
              Accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newTransaction),
          }
        );

        if (rsp.ok) {
          const result = await rsp.json();
          setTransactions(dateSorter(result));
          setTransactionsLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [username, year, redirectToErrorPage]
  );

  // PUT request that updates a transaction based on the username, year and month
  // Then it sets the transactions array to the array returned by the response
  const putTransaction = useCallback(
    async (edittedTransaction) => {
      try {
        const rsp = await fetch(
          `/api/transactions/${username}/${year}/${month}/transaction`,
          {
            method: "PUT",
            headers: {
              Accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(edittedTransaction),
          }
        );

        if (rsp.ok) {
          const result = await rsp.json();
          setTransactions(dateSorter(result));
          setTransactionsLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [username, year, month, redirectToErrorPage]
  );

  // DELETE request that deletes a transaction based on the username, year and month
  // Then it sets the transactions array to the array returned by the response
  const deleteTransaction = useCallback(
    async (transactionToDelete) => {
      const date = new Date(transactionToDelete.date);
      const month = date.toLocaleDateString("en-US", {
        month: "long",
        timeZone: "UTC",
      });

      try {
        const rsp = await fetch(
          `/api/transactions/${username}/${year}/${month}/transaction`,
          {
            method: "DELETE",
            headers: {
              Accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(transactionToDelete),
          }
        );

        if (rsp.ok) {
          const result = await rsp.json();
          setTransactions(dateSorter(result));
          setTransactionsLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [username, year, redirectToErrorPage]
  );

  const updateTransactions = useCallback(
    async (updatedTransactions) => {
      try {
        const rsp = await fetch(
          `/api/transactions/${username}/${year}/${month}/transactions`,
          {
            method: "PUT",
            headers: {
              Accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedTransactions),
          }
        );

        if (rsp.ok) {
          const result = await rsp.json();
          setTransactions(dateSorter(result));
          setTransactionsLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [username, year, month, redirectToErrorPage]
  );

  return {
    transactions,
    transactionsLoading,
    postTransaction,
    putTransaction,
    deleteTransaction,
    updateTransactions,
  };
};

export default useTransactions;
