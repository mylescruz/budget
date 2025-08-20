import { useCallback, useEffect, useState } from "react";

const useTransactions = (month, year) => {
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // GET request that returns the user's transaction based on the month and year
  useEffect(() => {
    const getTransactions = async () => {
      try {
        const rsp = await fetch(`/api/transactions/${year}/${month}`);

        if (rsp.ok) {
          const fetchedTransactions = await rsp.json();
          setTransactions(fetchedTransactions);
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
    };
    getTransactions();
  }, [month, year]);

  // POST request that adds a new transaction based on the month and year
  // Then it sets the transactions array to the array returned by the response
  const postTransaction = useCallback(
    async (newTransaction) => {
      try {
        const rsp = await fetch(`/api/transactions/${year}/${month}`, {
          method: "POST",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTransaction),
        });

        if (rsp.ok) {
          const addedTransaction = await rsp.json();
          setTransactions([...transactions, addedTransaction]);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [transactions, year, month]
  );

  // PUT request that updates a transaction based on the transaction's id
  // Then it sets the transactions array to the array returned by the response
  const putTransaction = useCallback(
    async (edittedTransaction) => {
      try {
        const rsp = await fetch(`/api/transaction/${edittedTransaction.id}`, {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(edittedTransaction),
        });

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
        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [transactions]
  );

  // DELETE request that deletes a transaction based on the username, year and month
  // Then it sets the transactions array to the array returned by the response
  const deleteTransaction = useCallback(
    async (transaction) => {
      try {
        const rsp = await fetch(`/api/transaction/${transaction.id}`, {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transaction),
        });

        if (rsp.ok) {
          const deleteResult = await rsp.json();

          const updatedTransactions = transactions.filter((transaction) => {
            return transaction.id !== deleteResult.id;
          });

          setTransactions(updatedTransactions);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [transactions]
  );

  const updateTransactions = useCallback(
    async (changedTransactions) => {
      try {
        const rsp = await fetch(`/api/transactions/${year}/${month}`, {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(changedTransactions),
        });

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
    [year, month]
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
