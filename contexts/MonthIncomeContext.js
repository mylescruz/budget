import useMonthIncome from "@/hooks/useMonthIncome";
import { createContext } from "react";

// Context for a user's income for the given month

export const MonthIncomeContext = createContext({});

export const MonthIncomeProvider = ({ children, dateInfo }) => {
  const { monthIncome, monthIncomeLoading } = useMonthIncome(
    dateInfo.month,
    dateInfo.year
  );

  return (
    <MonthIncomeContext.Provider
      value={{
        monthIncome,
        monthIncomeLoading,
      }}
    >
      {children}
    </MonthIncomeContext.Provider>
  );
};
