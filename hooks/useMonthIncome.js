import { useCallback, useEffect, useState } from "react";

const useMonthIncome = (month, year) => {
  const [monthIncome, setMonthIncome] = useState(0);
  const [monthIncomeLoading, setMonthIncomeLoading] = useState(true);
  const [monthIncomeRequest, setMonthIncomeRequest] = useState({
    action: null, //  get | null
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getMonthIncome(month, year);
  }, [month, year]);

  const getMonthIncome = useCallback(async (month, year) => {
    setMonthIncomeRequest({
      action: "get",
      status: "loading",
      message: "Getting your income for the month",
    });

    try {
      const response = await fetch(`/api/monthIncome/${year}/${month}`);

      if (!response.ok) {
        const message = await response.text();

        throw new Error(message);
      }

      const fetchedIncome = await response.text();
      setMonthIncome(Number(fetchedIncome));

      setMonthIncomeRequest({
        action: "get",
        status: "success",
        message: null,
      });
    } catch (error) {
      setMonthIncome(null);
      console.error(error);

      setMonthIncomeRequest({
        action: "get",
        status: "error",
        message: error.message,
      });
    } finally {
      setMonthIncomeLoading(false);
    }
  }, []);

  return { monthIncome, monthIncomeLoading, monthIncomeRequest };
};

export default useMonthIncome;
