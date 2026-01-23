import ascendingDateSorter from "@/helpers/ascendingDateSorter";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
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
          setIncome(ascendingDateSorter(fetchedIncome));
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
          setIncome(ascendingDateSorter([...income, addedSource]));
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
    [income, year],
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

          setIncome(ascendingDateSorter(updatedIncome));
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
    [income],
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

          setIncome(ascendingDateSorter(updatedIncome));
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
    [income],
  );

  const incomeTotals = useMemo(() => {
    if (!income) {
      return null;
    }

    const types = {
      Paycheck: 0,
      Gift: 0,
      Sale: 0,
      Unemployment: 0,
      Loan: 0,
    };

    let totalGross = 0;
    let totalDeductions = 0;
    let totalAmount = 0;

    for (const source of income) {
      const sourceAmount = dollarsToCents(source.amount);

      if (types[source.type] !== undefined) {
        types[source.type] += sourceAmount;
      }

      totalAmount += sourceAmount;

      if (source.type === "Paycheck") {
        totalGross += dollarsToCents(source.gross);
        totalDeductions += dollarsToCents(source.deductions);
      }
    }

    const typesTotals = Object.entries(types)
      .map(([key, value]) => {
        return {
          type: key,
          amount: centsToDollars(value),
        };
      })
      .filter((type) => type.amount > 0);

    return {
      gross: centsToDollars(totalGross),
      deductions: centsToDollars(totalDeductions),
      amount: centsToDollars(totalAmount),
      types: typesTotals,
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
