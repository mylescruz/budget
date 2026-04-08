import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import { INCOME_TYPES } from "@/lib/constants/income";
import { useEffect, useMemo, useState } from "react";

// Fetches and returns the user's income sources for a given month and year.
// Each income source includes its amount in USD. Paycheck sources include additional fields.
//
// Return value:
// [
//   {
//     _id: string,
//     date: string,              // date the income source was received
//     type: string,              // "Paycheck" | "Gift" | "Sale" | "Unemployment"
//     name: string,
//     description: string,
//     amount: number,            // in USD
//     gross?: number,            // in USD, only for type "Paycheck"
//     deductions?: number        // in USD, only for type "Paycheck"
//   }
// ]

const useIncome = (year) => {
  const [income, setIncome] = useState([]);
  const [incomeLoading, setIncomeLoading] = useState(true);
  const [incomeRequest, setIncomeRequest] = useState({
    action: null, //  get | create | update | delete | null
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getIncome();
  }, []);

  const getIncome = async () => {
    setIncomeLoading(true);

    setIncomeRequest({
      action: "get",
      status: "loading",
      message: "Getting your income",
    });

    try {
      const response = await fetch(`/api/income/year/${year}`);

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const fetchedIncome = await response.json();

      setIncome(fetchedIncome);

      setIncomeRequest({
        action: "get",
        status: "success",
        message: null,
      });
    } catch (error) {
      setIncome(null);
      console.error(error);

      setIncomeRequest({
        action: "get",
        status: "error",
        message: error.message,
      });
    } finally {
      setIncomeLoading(false);
    }
  };

  const postIncome = async (source) => {
    setIncomeRequest({
      action: "create",
      status: "loading",
      message: "Adding your new source of income",
    });

    try {
      const response = await fetch(`/api/income/year/${year}`, {
        method: "POST",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(source),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const addedSources = await response.json();

      setIncome((prev) => [...prev, ...addedSources]);

      setIncomeRequest({
        action: "create",
        status: "success",
        message: null,
      });
    } catch (error) {
      setIncomeRequest({
        action: "create",
        status: "error",
        message: error.message,
      });

      throw new Error(error);
    } finally {
      setIncomeLoading(false);
    }
  };

  const putIncome = async (source) => {
    setIncomeRequest({
      action: "update",
      status: "loading",
      message: "Updating this source of income",
    });

    try {
      const response = await fetch(`/api/income/${source._id}`, {
        method: "PUT",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(source),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const updatedSource = await response.json();

      setIncome((prev) =>
        prev.map((source) => {
          if (source._id === updatedSource._id) {
            return updatedSource;
          } else {
            return source;
          }
        }),
      );

      setIncomeRequest({
        action: "update",
        status: "success",
        message: null,
      });
    } catch (error) {
      setIncomeRequest({
        action: "update",
        status: "error",
        message: error.message,
      });

      throw new Error(error);
    } finally {
      setIncomeLoading(false);
    }
  };

  const deleteIncome = async (source) => {
    setIncomeRequest({
      action: "delete",
      status: "loading",
      message: "Deleting this source of income",
    });

    try {
      const response = await fetch(`/api/income/${source._id}`, {
        method: "DELETE",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(source),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const deletedSource = await response.json();

      setIncome((prev) =>
        prev.filter((source) => source._id !== deletedSource._id),
      );

      setIncomeRequest({
        action: "delete",
        status: "success",
        message: null,
      });
    } catch (error) {
      setIncomeRequest({
        action: "delete",
        status: "error",
        message: error.message,
      });

      throw new Error(error);
    } finally {
      setIncomeLoading(false);
    }
  };

  const incomeTotals = useMemo(() => {
    if (!income) {
      return null;
    }

    const types = {
      Paycheck: 0,
      Gift: 0,
      Sale: 0,
      Unemployment: 0,
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

      if (source.type === INCOME_TYPES.PAYCHECK) {
        totalGross += dollarsToCents(source.gross);
        totalDeductions += dollarsToCents(source.deductions);
      }
    }

    const typesTotals = Object.entries(types)
      .map(([key, value]) => {
        const type = {
          type: key,
          amount: centsToDollars(value),
        };

        if (key === INCOME_TYPES.PAYCHECK) {
          type.gross = centsToDollars(totalGross);
          type.deductions = centsToDollars(totalDeductions);
        }

        return type;
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
    incomeRequest,
    postIncome,
    putIncome,
    deleteIncome,
    incomeTotals,
  };
};

export default useIncome;
