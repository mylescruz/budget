import { MONTHS } from "@/lib/constants/date";
import { useCallback, useEffect, useState } from "react";

const useBudget = (month, year) => {
  const [budget, setBudget] = useState({
    categories: null,
    transactions: null,
  });
  const [budgetRequest, setBudgetRequest] = useState({
    action: "get", // get | create | update | delete
    status: "loading", // loading | success | error
    message: `Loading your budget for ${MONTHS[month]} ${year}`,
  });

  // Fetch a user's categories and transactions for the current month
  const getBudget = useCallback(async () => {
    setBudgetRequest({
      action: "get",
      status: "loading",
      message: `Loading your budget for ${MONTHS[month]} ${year}`,
    });

    try {
      const response = await fetch(`/api/budget/${year}/${month}`);

      if (!response.ok) {
        const message = await response.text();

        throw new Error(message);
      }

      const fetchedBudget = await response.json();

      setBudget({
        categories: fetchedBudget.categories,
        transactions: fetchedBudget.transactions,
      });

      setBudgetRequest({
        action: "get",
        status: "success",
        message: "Successfully loaded your budget",
      });
    } catch (error) {
      //   throw error;
      setBudgetRequest({
        action: "get",
        status: "error",
        message: error.message,
      });
    }
  }, [month, year]);

  useEffect(() => {
    getBudget();
  }, [getBudget]);

  // Transaction mutation methods

  const postTransactions = async (newTransactions) => {
    setBudgetRequest({
      action: "create",
      status: "loading",
      message: `Adding your transaction${newTransactions.length > 1 && "s"} to your budget`,
    });

    try {
      const response = await fetch(`/api/transactions/${year}/${month}`, {
        method: "POST",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransactions),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const addedTransactions = await response.json();

      // Add the new transaction(s) to the transactions state
      setBudget((prev) => {
        const updatedTransactions = [
          ...prev.transactions,
          ...addedTransactions,
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        return {
          ...prev,
          transactions: updatedTransactions,
        };
      });

      setBudgetRequest({
        action: "create",
        status: "success",
        message: `Successfully added your new transaction${newTransactions.length > 1 && "s"}`,
      });
    } catch (error) {
      setBudgetRequest({
        action: "create",
        status: "error",
        message: error.message,
      });

      throw error;
    }
  };

  const putTransaction = async (editedTransaction) => {
    setBudgetRequest({
      action: "update",
      status: "loading",
      message: "Updating this transaction",
    });

    try {
      const response = await fetch(
        `/api/transaction/${editedTransaction._id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedTransaction),
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const updatedTransaction = await response.json();

      // Replace the updated transaction in the transactions state
      setBudget((prev) => {
        const updatedTransactions = prev.transactions.map((transaction) =>
          transaction._id === updatedTransaction._id
            ? updatedTransaction
            : transaction,
        );

        return {
          ...prev,
          transactions: updatedTransactions,
        };
      });

      setBudgetRequest({
        action: "update",
        status: "success",
        message: "Successfully updated this transaction!",
      });
    } catch (error) {
      setBudgetRequest({
        action: "update",
        status: "error",
        message: error.message,
      });

      throw error;
    }
  };

  const deleteTransaction = async (deletedTransaction) => {
    setBudgetRequest({
      action: "delete",
      status: "loading",
      message: "Deleting this transaction",
    });

    try {
      const response = await fetch(
        `/api/transaction/${deletedTransaction._id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      // Delete the transaction in the transactions state
      setBudget((prev) => {
        const updatedTransactions = prev.transactions.filter(
          (transaction) => transaction._id !== deletedTransaction._id,
        );

        return {
          ...prev,
          transactions: updatedTransactions,
        };
      });

      setBudgetRequest({
        action: "delete",
        status: "success",
        message: "Successfully deleted the transaction",
      });
    } catch (error) {
      setBudgetRequest({
        action: "delete",
        status: "error",
        message: error.message,
      });

      throw error;
    }
  };

  return {
    categories: budget.categories,
    transactions: budget.transactions,
    budgetRequest,
    postTransactions,
    putTransaction,
    deleteTransaction,
  };
};

export default useBudget;
