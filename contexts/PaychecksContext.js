import usePaychecks from "@/hooks/usePaychecks";
import { createContext } from "react";

// Context for the paychecks array and API calls

export const PaychecksContext = createContext({});

export const PaychecksProvider = ({ children, dateInfo }) => {
  const {
    paychecks,
    paychecksLoading,
    postPaycheck,
    putPaycheck,
    deletePaycheck,
  } = usePaychecks(dateInfo.year);

  return (
    <PaychecksContext.Provider
      value={{
        paychecks,
        paychecksLoading,
        postPaycheck,
        putPaycheck,
        deletePaycheck,
      }}
    >
      {children}
    </PaychecksContext.Provider>
  );
};
