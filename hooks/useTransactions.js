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
          const fetchedTransactions = await rsp.json();
          setTransactions(dateSorter(fetchedTransactions));
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
      const transactionMonth = date.toLocaleDateString("en-US", {
        month: "long",
        timeZone: "UTC",
      });
      const transactionYear = date.toLocaleDateString("en-US", {
        year: "numeric",
        timeZone: "UTC",
      });

      try {
        const rsp = await fetch(
          `/api/transactions/${username}/${transactionYear}/${transactionMonth}/transaction`,
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
          const addedTransaction = await rsp.json();
          setTransactions(dateSorter([...transactions, addedTransaction]));
          setTransactionsLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [transactions, username, redirectToErrorPage]
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
          const updatedTransaction = await rsp.json();

          const updatedTransactions = transactions.map((transaction) => {
            if (transaction.id === updatedTransaction.id) {
              return updatedTransaction;
            } else {
              return transaction;
            }
          });

          setTransactions(dateSorter(updatedTransactions));
          setTransactionsLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [transactions, username, year, month, redirectToErrorPage]
  );

  // DELETE request that deletes a transaction based on the username, year and month
  // Then it sets the transactions array to the array returned by the response
  const deleteTransaction = useCallback(
    async (transactionToDelete) => {
      const date = new Date(transactionToDelete.date);
      const transactionMonth = date.toLocaleDateString("en-US", {
        month: "long",
        timeZone: "UTC",
      });
      const transactionYear = date.toLocaleDateString("en-US", {
        year: "numeric",
        timeZone: "UTC",
      });

      try {
        const rsp = await fetch(
          `/api/transactions/${username}/${transactionYear}/${transactionMonth}/transaction`,
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
          const deletedTransaction = await rsp.json();

          const updatedTransactions = transactions.filter((transaction) => {
            return transaction.id !== deletedTransaction.id;
          });

          setTransactions(dateSorter(updatedTransactions));
          setTransactionsLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [transactions, username, redirectToErrorPage]
  );

  const updateTransactions = useCallback(
    async (edittedTransactions) => {
      try {
        const rsp = await fetch(
          `/api/transactions/${username}/${year}/${month}/transactions`,
          {
            method: "PUT",
            headers: {
              Accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(edittedTransactions),
          }
        );

        if (rsp.ok) {
          const updatedTransactions = await rsp.json();
          setTransactions(dateSorter(updatedTransactions));
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
