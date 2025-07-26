import useIncome from "@/hooks/useIncome";
import { useSession } from "next-auth/react";
import { createContext } from "react";

// Context for the income array and API calls
// Used throughout the budgetLayout component

export const IncomeContext = createContext({});

export const IncomeProvider = ({ children, monthInfo }) => {
  const { data: session } = useSession();

  const {
    income,
    incomeLoading,
    postIncome,
    putIncome,
    deleteIncome,
    getMonthIncome,
  } = useIncome(session.user.username, monthInfo.year);

  return (
    <IncomeContext.Provider
      value={{
        income,
        incomeLoading,
        postIncome,
        putIncome,
        deleteIncome,
        getMonthIncome,
      }}
    >
      {children}
    </IncomeContext.Provider>
  );
};
