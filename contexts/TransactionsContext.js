import useTransactions from "@/hooks/useTransactions";
import { createContext } from "react";

// Context for the transactions array and API calls
// Used throughout the budgetLayout component

export const TransactionsContext = createContext({});

export const TransactionsProvider = ({ children, dateInfo }) => {
  const {
    transactions,
    transactionsRequest,
    getTransactions,
    postTransactions,
    putTransaction,
    deleteTransaction,
    updateTransactionsFromCategory,
    removeFixedCategoryTransactions,
    transactionTotals,
  } = useTransactions(dateInfo.month, dateInfo.year);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        transactionsRequest,
        getTransactions,
        postTransactions,
        putTransaction,
        deleteTransaction,
        updateTransactionsFromCategory,
        removeFixedCategoryTransactions,
        transactionTotals,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};
