import usePaychecks from "@/hooks/usePaychecks";
import { createContext } from "react";

// Context for the paychecks array and API calls

export const PaychecksContext = createContext({});

export const PaychecksProvider = ({ children, monthInfo }) => {
  const {
    paychecks,
    paychecksLoading,
    postPaycheck,
    putPaycheck,
    deletePaycheck,
    getMonthIncome,
  } = usePaychecks(monthInfo.year);

  return (
    <PaychecksContext.Provider
      value={{
        paychecks,
        paychecksLoading,
        postPaycheck,
        putPaycheck,
        deletePaycheck,
        getMonthIncome,
      }}
    >
      {children}
    </PaychecksContext.Provider>
  );
};
