import { useEffect, useState } from "react";

// Fetches and returns the user's previous categories that are not in the current budget.
// Each category includes its budget, actual spending, and any nested subcategories.
// Fixed categories include additional fields such as frequency, dueDate, and budget.
//
// Return value:
// [
//   {
//     _id: string,
//     name: string,
//     color: string,
//     fixed: boolean,
//     budget: number,              // in USD
//     actual: number,              // in USD (includes subcategories)
//     subcategories: [
//       {
//         _id: string,
//         name: string,
//         fixed: boolean,
//         parentCategoryId: string,
//         budget?: number,         // in USD, only if fixed
//         actual: number,          // in USD
//         frequency?: string,      // "Monthly" | "Semi-Annually" | "Annually", only if fixed
//         dueDate?: number         // only if fixed
//       }
//     ],
//     frequency?: string,          // "Monthly" | "Semi-Annually" | "Annually", only if fixed with no subcategories:
//     dueDate?: number,            // only if fixed with no subcategories
//   }
// ]

const usePreviousCategories = (month, year) => {
  const [previousCategories, setPreviousCategories] = useState(null);
  const [previousCategoriesRequest, setPreviousCategoriesRequest] = useState({
    action: null, // get | null
    status: "loading", // loading | success | error
    message: null,
  });

  useEffect(() => {
    getPreviousCategories();
  }, [month, year]);

  const getPreviousCategories = async () => {
    setPreviousCategoriesRequest({
      action: "get",
      status: "loading",
      message: "Getting your previously created categories",
    });

    try {
      const response = await fetch(`/api/categories/previous/${year}/${month}`);

      if (!response.ok) {
        const message = await response.text();

        throw new Error(message);
      }

      const fetchedPreviousCategories = await response.json();

      setPreviousCategories(fetchedPreviousCategories);

      setPreviousCategoriesRequest({
        action: "get",
        status: "success",
        message: null,
      });
    } catch (error) {
      setPreviousCategoriesRequest({
        action: "get",
        status: "error",
        message: error.message,
      });

      console.error(error);
    }
  };

  return {
    previousCategories,
    previousCategoriesRequest,
  };
};

export default usePreviousCategories;
