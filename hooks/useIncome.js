import { useCallback, useEffect, useMemo, useState } from "react";

const useIncome = (year) => {
  const [income, setIncome] = useState([]);
  const [incomeLoading, setIncomeLoading] = useState(true);

  useEffect(() => {
    const getIncome = async () => {
      setIncomeLoading(true);

      try {
        const response = await fetch(`/api/income/year/${year}`);

        if (response.ok) {
          const fetchedIncome = await response.json();
          setIncome(fetchedIncome);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        setIncome(null);
        console.error(error);
      } finally {
        setIncomeLoading(false);
      }
    };

    getIncome();
  }, [year]);

  const postIncome = useCallback(
    async (source) => {
      try {
        const response = await fetch(`/api/income/year/${year}`, {
          method: "POST",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(source),
        });

        if (response.ok) {
          const addedSource = await response.json();
          setIncome([...income, addedSource]);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        throw new Error(error);
      } finally {
        setIncomeLoading(false);
      }
    },
    [income, year]
  );

  const putIncome = useCallback(
    async (source) => {
      try {
        const response = await fetch(`/api/income/${source._id}`, {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(source),
        });

        if (response.ok) {
          const updatedSource = await response.json();

          const updatedIncome = income.map((source) => {
            if (source._id === updatedSource._id) {
              return updatedSource;
            } else {
              return source;
            }
          });

          setIncome(updatedIncome);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        throw new Error(error);
      } finally {
        setIncomeLoading(false);
      }
    },
    [income]
  );

  const deleteIncome = useCallback(
    async (source) => {
      try {
        const response = await fetch(`/api/income/${source._id}`, {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(source),
        });

        if (response.ok) {
          const deletedSource = await response.json();

          const updatedIncome = income.filter((source) => {
            return source._id !== deletedSource._id;
          });

          setIncome(updatedIncome);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        throw new Error(error);
      } finally {
        setIncomeLoading(false);
      }
    },
    [income]
  );

  const incomeTotals = useMemo(() => {
    let totalGross = 0;
    let totalDeductions = 0;
    let totalAmount = 0;

    for (const source of income) {
      if (source.gross) {
        totalGross += source.gross * 100;
      }

      if (source.deductions) {
        totalDeductions += source.deductions * 100;
      }

      totalAmount += source.amount * 100;
    }

    return {
      gross: totalGross / 100,
      deductions: totalDeductions / 100,
      amount: totalAmount / 100,
    };
  }, [income]);

  return {
    income,
    incomeLoading,
    postIncome,
    putIncome,
    deleteIncome,
    incomeTotals,
  };
};

export default useIncome;
