import useTransactions from "@/hooks/useTransactions";
import { createContext } from "react";

// Context for the transactions array and API calls
// Used throughout the budgetLayout component

export const TransactionsContext = createContext({});

export const TransactionsProvider = ({ children, monthInfo }) => {
  const {
    transactions,
    transactionsLoading,
    postTransaction,
    putTransaction,
    deleteTransaction,
    updateTransactions,
  } = useTransactions(monthInfo.monthNumber, monthInfo.year);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        transactionsLoading,
        postTransaction,
        putTransaction,
        deleteTransaction,
        updateTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};
