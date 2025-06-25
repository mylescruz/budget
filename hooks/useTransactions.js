import { useCallback, useEffect, useState } from "react";

const useTransactions = (username, month, year) => {
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // GET request that returns the user's transaction based on the username, year and month
  useEffect(() => {
    const getTransactions = async () => {
      try {
        const rsp = await fetch(
          `/api/transactions/${username}/${year}/${month}/transaction`
        );

        if (rsp.ok) {
          const fetchedTransactions = await rsp.json();
          setTransactions(fetchedTransactions);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        setTransactions(null);
        console.error(null);
      } finally {
        setTransactionsLoading(false);
      }
    };
    getTransactions();
  }, [username, month, year]);

  // POST request that adds a new transaction based on the username, year and month
  // Then it sets the transactions array to the array returned by the response
  const postTransaction = useCallback(
    async (newTransaction) => {
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
          const addedTransaction = await rsp.json();
          setTransactions([...transactions, addedTransaction]);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        setTransactions(null);
        console.error(error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [year, month, transactions, username]
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

          setTransactions(updatedTransactions);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        setTransactions(null);
        console.error(error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [transactions, username, year, month]
  );

  // DELETE request that deletes a transaction based on the username, year and month
  // Then it sets the transactions array to the array returned by the response
  const deleteTransaction = useCallback(
    async (transactionToDelete) => {
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
          const deletedTransaction = await rsp.json();

          const updatedTransactions = transactions.filter((transaction) => {
            return transaction.id !== deletedTransaction.id;
          });

          setTransactions(updatedTransactions);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        setTransactions(null);
        console.error(error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [year, month, transactions, username]
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
          setTransactions(updatedTransactions);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        setTransactions(null);
        console.error(error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [username, year, month]
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
