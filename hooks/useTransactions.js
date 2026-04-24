import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import {
  TRANSACTION_TYPES,
  TRANSFER_ACCOUNTS,
} from "@/lib/constants/transactions";
import { useEffect, useMemo, useState } from "react";

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
  const [transactions, setTransactions] = useState(null);
  const [transactionsRequest, setTransactionsRequest] = useState({
    action: "get", // get
    status: "loading", // loading | success | error
    message: "Getting your transactions for the month",
  });

  useEffect(() => {
    getTransactions();
  }, [month, year]);

  const getTransactions = async () => {
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
    }
  };

  const transactionTotals = useMemo(() => {
    if (!transactions) {
      return null;
    }

    const totals = transactions.reduce(
      (sum, transaction) => {
        const amount = dollarsToCents(transaction.amount);

        if (transaction.type === TRANSACTION_TYPES.INCOME) {
          sum.income += amount;
        } else if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
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
        income: 0,
        expenses: 0,
        toChecking: 0,
        toSavings: 0,
      },
    );

    return {
      income: centsToDollars(totals.income),
      expenses: centsToDollars(totals.expenses),
      checkingTransfers: centsToDollars(totals.toChecking),
      savingsTransfers: centsToDollars(totals.toSavings),
    };
  }, [transactions]);

  return {
    transactions,
    transactionsRequest,
    getTransactions,
    transactionTotals,
  };
};

export default useTransactions;
