import { REQUEST_STATUS, REQUEST_TYPE } from "@/lib/constants/requests";
import { useEffect, useMemo, useState } from "react";

// Fetches and returns the user's debts.
//
// Return value:
// [
//      {
//          _id: ObjectId(),
//          username: string,
//          type: string,                // Loan, Credit Card
//          lender: string,
//          active: boolean,
//          currentBalance: number,      // in USD
//          apr: number,                 // Percentage
//          originalBalance: number,     // in USD
//          monthlyPayment: number,      // in USD
//          startDate: date,
//          targetPayoffDate: date,
//          creditLimit: number,         // in USD
//          promoAPR: number,            // Percentage
//          promoAPREndDate: date,
//          createdTS: date,
//          updatedTS: date,
//      }
// ]

const useDebts = () => {
  const [debts, setDebts] = useState(null);
  const [debtsRequest, setDebtsRequest] = useState({
    action: REQUEST_TYPE.GET,
    status: REQUEST_STATUS.LOADING,
    message: "Getting your debt",
  });

  useEffect(() => {
    const getDebts = async () => {
      setDebtsRequest({
        action: REQUEST_TYPE.GET,
        status: REQUEST_STATUS.LOADING,
        message: "Getting your debt",
      });

      try {
        const response = await fetch("/api/debts");

        if (!response.ok) {
          const errorMessage = await response.text();

          throw new Error(errorMessage);
        }

        // Get the debt array from the API
        const fetchedDebts = await response.json();

        // Set the debt array to the API
        setDebts(fetchedDebts);

        setDebtsRequest({
          action: REQUEST_TYPE.GET,
          status: REQUEST_STATUS.SUCCESS,
          message: "Successfully fetched your debt",
        });
      } catch (error) {
        setDebtsRequest({
          action: REQUEST_TYPE.GET,
          status: REQUEST_STATUS.ERROR,
          message: error.message,
        });
      }
    };

    getDebts();
  }, []);

  // Add a new debt to the database
  const postDebt = async (newDebt) => {
    setDebtsRequest({
      action: REQUEST_TYPE.POST,
      status: REQUEST_STATUS.LOADING,
      message: "Adding your new debt",
    });

    try {
      const response = await fetch("/api/debts", {
        method: REQUEST_TYPE.POST,
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDebt),
      });

      if (!response.ok) {
        const errorMessage = await response.text();

        throw new Error(errorMessage);
      }

      // Get the inserted debt
      const addedDebt = await response.json();

      // Add the new debt to the debts array
      setDebts((prev) => [...prev, addedDebt]);

      setDebtsRequest({
        action: REQUEST_TYPE.POST,
        status: REQUEST_STATUS.SUCCESS,
        message: "Successfully added your debt",
      });
    } catch (error) {
      setDebtsRequest({
        action: REQUEST_TYPE.POST,
        status: REQUEST_STATUS.ERROR,
        message: error.message,
      });

      throw error;
    }
  };

  // Delete a debt from the database and remove it from the debts state
  const deleteDebt = async (debtId) => {
    setDebtsRequest({
      action: REQUEST_TYPE.DELETE,
      status: REQUEST_STATUS.LOADING,
      message: "Deleting this debt",
    });

    try {
      const response = await fetch(`/api/debts/${debtId}`, {
        method: REQUEST_TYPE.DELETE,
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();

        throw new Error(errorMessage);
      }

      // Get the deleted debt _id and delete message
      const deletedDebt = await response.json();

      // Remove the debt from the debts array
      setDebts((prev) => {
        return prev.filter((debt) => debt._id !== deletedDebt._id);
      });

      setDebtsRequest({
        action: REQUEST_TYPE.DELETE,
        status: REQUEST_STATUS.SUCCESS,
        message: deletedDebt.message,
      });
    } catch (error) {
      setDebtsRequest({
        action: REQUEST_TYPE.DELETE,
        status: REQUEST_STATUS.ERROR,
        message: error.message,
      });

      throw error;
    }
  };

  // Status of the API call to the debts endpoint
  const reqStatus = useMemo(() => {
    if (!debtsRequest) {
      return null;
    }

    return {
      isInitialLoad:
        debtsRequest.action === REQUEST_TYPE.GET &&
        debtsRequest.status === REQUEST_STATUS.LOADING,
      isInitialError:
        debtsRequest.action === REQUEST_TYPE.GET &&
        debtsRequest.status === REQUEST_STATUS.ERROR,
      isError:
        debtsRequest.action !== REQUEST_TYPE.GET &&
        debtsRequest.status === REQUEST_STATUS.ERROR,
      isSuccess:
        debtsRequest.action !== REQUEST_TYPE.GET &&
        debtsRequest.status === REQUEST_STATUS.SUCCESS,
      hasData: debtsRequest.status === REQUEST_STATUS.SUCCESS,
      message: debtsRequest.message,
    };
  }, [debtsRequest]);

  return { debts, reqStatus, postDebt, deleteDebt };
};

export default useDebts;
