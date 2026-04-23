// Context to allow the useBudget hook objects to be used throughout the budget page

import useBudget from "@/hooks/useBudget";
import { createContext } from "react";

export const BudgetContext = createContext({});

export const BudgetProvider = ({ children, dateInfo }) => {
  const { categories, transactions, budgetRequest } = useBudget(
    dateInfo.month,
    dateInfo.year,
  );

  return (
    <BudgetContext.Provider
      value={{
        categories,
        transactions,
        budgetRequest,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
