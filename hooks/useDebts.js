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
//          startDate: date,
//          targetPayoffDate: date,
//          creditLimit: number,         // in USD
//          promoAPR: number,            // Percentage
//          promoAPREndDate: date,
//          notes: string,
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
      hasData: debtsRequest.status === REQUEST_STATUS.SUCCESS,
      message: debtsRequest.message,
    };
  }, [debtsRequest]);

  return { debts, reqStatus };
};

export default useDebts;
