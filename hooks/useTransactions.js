import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import {
  TRANSACTION_TYPES,
  TRANSFER_ACCOUNTS,
} from "@/lib/constants/transactions";
import { useCallback, useEffect, useMemo, useState } from "react";

const useTransactions = (month, year) => {
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // Function to retrieve transactions from the server
  const getTransactions = useCallback(async (month, year) => {
    setTransactionsLoading(true);

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
  }, []);

  // GET request that returns the user's transaction based on the month and year
  useEffect(() => {
    getTransactions(month, year);
  }, [month, year, getTransactions]);

  // Add the new transactions to the database
  const postTransactions = useCallback(
    async (newTransactions) => {
      try {
        const response = await fetch(`/api/transactions/${year}/${month}`, {
          method: "POST",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTransactions),
        });

        if (response.ok) {
          const addedTransactions = await response.json();
          setTransactions((prev) => [...prev, ...addedTransactions]);

          return addedTransactions;
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [transactions, year, month],
  );

  // PUT request that updates a transaction based on the transaction's id
  // Then it sets the transactions array to the array returned by the response
  const putTransaction = useCallback(
    async (edittedTransaction) => {
      try {
        const response = await fetch(
          `/api/transaction/${edittedTransaction._id}`,
          {
            method: "PUT",
            headers: {
              Accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(edittedTransaction),
          },
        );

        if (response.ok) {
          const updatedTransaction = await response.json();

          const updatedTransactions = transactions.map((transaction) => {
            if (transaction._id === updatedTransaction._id) {
              return updatedTransaction;
            } else {
              return transaction;
            }
          });

          setTransactions(updatedTransactions);

          return updatedTransaction;
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [transactions],
  );

  // DELETE request that deletes a transaction based on the username, year and month
  // Then it sets the transactions array to the array returned by the response
  const deleteTransaction = useCallback(
    async (transactionId) => {
      try {
        const rsp = await fetch(`/api/transaction/${transactionId}`, {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
        });

        if (rsp.ok) {
          const updatedTransactions = transactions.filter((transaction) => {
            return transaction._id !== transactionId;
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
    [transactions],
  );

  const transactionTotals = useMemo(() => {
    if (!transactions) {
      return null;
    }

    const totals = transactions.reduce(
      (sum, transaction) => {
        const amount = dollarsToCents(transaction.amount);

        if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
          sum.expenses += amount;
        } else {
          if (transaction.toAccount === TRANSFER_ACCOUNTS.CHECKING) {
            sum.toChecking += amount;
          } else {
            sum.toSavings += amount;
          }
        }

        return sum;
      },
      {
        expenses: 0,
        toChecking: 0,
        toSavings: 0,
      },
    );

    return {
      expenses: centsToDollars(totals.expenses),
      checkingTransfers: centsToDollars(totals.toChecking),
      savingsTransfers: centsToDollars(totals.toSavings),
    };
  }, [transactions]);

  return {
    transactions,
    transactionsLoading,
    getTransactions,
    postTransactions,
    putTransaction,
    deleteTransaction,
    transactionTotals,
  };
};

export default useTransactions;
