// Context to allow the useBudget hook objects to be used throughout the budget page

import useBudget from "@/hooks/useBudget";
import { createContext } from "react";

export const BudgetContext = createContext({});

export const BudgetProvider = ({ children, month, year }) => {
  const {
    categories,
    transactions,
    budgetRequest,
    transactionTotals,
    categoryTotals,
    categoryColors,
    categoryNames,
    postTransactions,
    putTransaction,
    deleteTransaction,
    postCategory,
    putCategory,
    deleteCategory,
  } = useBudget(month, year);

  return (
    <BudgetContext.Provider
      value={{
        categories,
        transactions,
        budgetRequest,
        transactionTotals,
        categoryTotals,
        categoryColors,
        categoryNames,
        postTransactions,
        putTransaction,
        deleteTransaction,
        postCategory,
        putCategory,
        deleteCategory,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
