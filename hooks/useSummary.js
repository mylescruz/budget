import { useEffect, useState } from "react";

// Fetches and returns a yearly summary for the user, including categories, income, transactions, and monthly breakdowns.
// Each part includes totals and derived values in USD.
//
// Return value:
// {
//   categories: [
//     {
//       name: string,
//       color: string,
//       fixed: boolean,
//       budget: number,             // in USD
//       actual: number,             // in USD
//       remaining: number,          // in USD (budget - actual)
//       average: number,            // average per month in USD
//       subcategories: [
//         {
//           name: string,
//           actual: number,         // in USD
//           average: number,        // average per month in USD
//           totalMonths: number
//         }
//       ],
//       totalMonths: number
//     }
//   ],
//   income: {
//     totalIncome: {
//       gross?: number,             // in USD, only if "Paycheck" income exists
//       deductions?: number,        // in USD, only if "Paycheck" income exists
//       amount: number              // total income in USD
//     },
//     types: [
//       {
//         name: string,
//         amount: number,           // in USD
//         gross?: number,           // in USD, only for type "Paycheck"
//         deductions?: number       // in USD, only for type "Paycheck"
//       }
//     ]
//   },
//   transactions: [
//     {
//       type: string,
//       date: string,
//       createdTS: number,
//       store?: string,              // only if type "Expense"
//       items?: string,              // only if type "Expense"
//       categoryId?: string,         // only if type "Expense"
//       fromAccount?: string,        // only if type "Transfer"
//       toAccount?: string,          // only if type "Transfer"
//       description: string,
//       amount: number,              // in USD
//       category?: string,           // only if type "Expense"
//       color?: string,              // only if type "Expense"
//       fixed?: boolean,             // only if type "Expense"
//       parentCategoryId?: string    // only if type "Expense" and if transaction is correlated to a subcategory
//     }
//   ],
//   months: [
//     {
//       number: number,            // month number (1-12)
//       name: string,              // month name, e.g., "January"
//       income: number,            // in USD
//       actual: number,            // in USD
//       remaining: number,         // in USD (income - actual)
//       transfers: {
//         in: number,              // in USD
//         out: number              // in USD
//       }
//     }
//   ],
//   monthsLength: number           // total number of months in the summary
// }

const useSummary = (year) => {
  const [summary, setSummary] = useState(null);
  const [summaryRequest, setSummaryRequest] = useState({
    action: null, //  get | null
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getSummary();
  }, [year]);

  const getSummary = async () => {
    setSummaryRequest({
      action: "get",
      status: "loading",
      message: `Getting your budget summary for ${year}`,
    });

    try {
      const response = await fetch(`/api/summary/${year}`);

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const fetchedSummary = await response.json();

      setSummary(fetchedSummary);

      setSummaryRequest({
        action: "get",
        status: "success",
        message: null,
      });
    } catch (error) {
      setSummaryRequest({
        action: "get",
        status: "error",
        message: error.message,
      });

      console.error(error);
    }
  };

  return { summary, summaryLoading, summaryRequest };
};

export default useSummary;
