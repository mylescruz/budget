import { useEffect, useState } from "react";

const useMonthIncome = (month, year) => {
  const [monthIncome, setMonthIncome] = useState(0);
  const [monthIncomeLoading, setMonthIncomeLoading] = useState(true);

  useEffect(() => {
    const getMonthIncome = async (month, year) => {
      try {
        const rsp = await fetch(`/api/monthIncome/${year}/${month}`);

        const result = await rsp.text();
        setMonthIncome(parseFloat(result));
      } catch (error) {
        setMonthIncome(null);
        console.error(error);
      } finally {
        setMonthIncomeLoading(false);
      }
    };

    getMonthIncome(month, year);
  }, [month, year]);

  return { monthIncome, monthIncomeLoading };
};

export default useMonthIncome;
