import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import {
  TRANSACTION_TYPES,
  TRANSFER_ACCOUNTS,
} from "@/lib/constants/transactions";
import { useCallback, useEffect, useMemo, useState } from "react";

// Fetches and returns all transactions for the user for a given month and year.
// Each transaction includes its amount in USD and optional category information.
//
// Return value:
// [
//   {
//      type: string,
//      date: string,
//      createdTS: number,
//      store?: string,              // only if type "Expense"
//      items?: string,              // only if type "Expense"
//      categoryId?: string,         // only if type "Expense"
//      fromAccount?: string,        // only if type "Transfer"
//      toAccount?: string,          // only if type "Transfer"
//      description: string,         // only if type "Transfer"
//      amount: number,              // in USD
//      category?: string,           // only if type "Expense"
//      color?: string,              // only if type "Expense"
//      fixed?: boolean,             // only if type "Expense"
//      parentCategoryId?: string    // only if type "Expense" and if transaction is correlated to a subcategory
//   }
// ]

const useTransactions = (month, year) => {
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsRequest, setTransactionsRequest] = useState({
    action: null, //  get | create | update | delete | null
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getTransactions(month, year);
  }, [month, year, getTransactions]);

  const getTransactions = useCallback(async (month, year) => {
    setTransactionsLoading(true);
    setTransactionsRequest({
      action: "get",
      status: "loading",
      message: "Getting your transactions for the month",
    });

    try {
      const response = await fetch(`/api/transactions/${year}/${month}`);

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const fetchedTransactions = await response.json();

      setTransactions(fetchedTransactions);

      setTransactionsRequest({
        action: "get",
        status: "success",
        message: null,
      });
    } catch (error) {
      setTransactionsRequest({
        action: "get",
        status: "error",
        message: error.message,
      });

      setTransactions(null);
      console.error(error);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  // Add the new transactions to the database
  const postTransactions = useCallback(
    async (newTransactions) => {
      setTransactionsRequest({
        action: "create",
        status: "loading",
        message: "Adding your transaction(s) to your budget",
      });

      try {
        const response = await fetch(`/api/transactions/${year}/${month}`, {
          method: "POST",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTransactions),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message);
        }

        const addedTransactions = await response.json();
        setTransactions((prev) => [...prev, ...addedTransactions]);

        setTransactionsRequest({
          action: "create",
          status: "success",
          message: null,
        });

        return addedTransactions;
      } catch (error) {
        setTransactionsRequest({
          action: "create",
          status: "error",
          message: error.message,
        });

        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [year, month],
  );

  // PUT request that updates a transaction based on the transaction's id
  // Then it sets the transactions array to the array returned by the response
  const putTransaction = useCallback(async (edittedTransaction) => {
    setTransactionsRequest({
      action: "update",
      status: "loading",
      message: "Updating this transaction",
    });

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

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const updatedTransaction = await response.json();

      setTransactions((prev) =>
        prev.map((transaction) => {
          if (transaction._id === updatedTransaction._id) {
            return updatedTransaction;
          } else {
            return transaction;
          }
        }),
      );

      setTransactionsRequest({
        action: "update",
        status: "success",
        message: null,
      });

      return updatedTransaction;
    } catch (error) {
      setTransactionsRequest({
        action: "update",
        status: "error",
        message: error.message,
      });

      // Send the error back to the component to show the user
      throw new Error(error);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  // DELETE request that deletes a transaction based on the username, year and month
  // Then it sets the transactions array to the array returned by the response
  const deleteTransaction = useCallback(async (transactionId) => {
    setTransactionsRequest({
      action: "delete",
      status: "loading",
      message: "Deleting this transaction",
    });

    try {
      const response = await fetch(`/api/transaction/${transactionId}`, {
        method: "DELETE",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      setTransactions((prev) =>
        prev.filter((transaction) => {
          return transaction._id !== transactionId;
        }),
      );

      setTransactionsRequest({
        action: "delete",
        status: "success",
        message: null,
      });
    } catch (error) {
      setTransactionsRequest({
        action: "delete",
        status: "error",
        message: error.message,
      });

      // Send the error back to the component to show the user
      throw new Error(error);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

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
    transactionsRequest,
    getTransactions,
    postTransactions,
    putTransaction,
    deleteTransaction,
    transactionTotals,
  };
};

export default useTransactions;
