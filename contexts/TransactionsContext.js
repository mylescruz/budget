import useTransactions from "@/hooks/useTransactions";
import { useSession } from "next-auth/react";
import { createContext } from "react";

// Context for the transactions array and API calls
// Used throughout the budgetLayout component

export const TransactionsContext = createContext({});

export const TransactionsProvider = ({ children, monthInfo }) => {
  const { data: session } = useSession();

  const {
    transactions,
    transactionsLoading,
    postTransaction,
    putTransaction,
    deleteTransaction,
    updateTransactions,
  } = useTransactions(session.user.username, monthInfo.month, monthInfo.year);

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
