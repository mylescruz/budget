import { useEffect, useMemo, useState } from "react";
import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";

// Fetches and returns the user's categories for a given month and year.
// Each category includes its budget, actual spending, and any nested subcategories.
// Fixed categories may include additional scheduling fields.
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
//     noDelete?: boolean           // present for protected category: Fun Money
//   }
// ]

const useCategories = (month, year) => {
  const [categories, setCategories] = useState(null);
  const [categoriesRequest, setCategoriesRequest] = useState({
    action: "get", // get
    status: "loading", // loading | success | error
    message: "Getting your categories for the month",
  });

  useEffect(() => {
    getCategories();
  }, [month, year]);

  const getCategories = async () => {
    setCategoriesRequest({
      action: "get",
      status: "loading",
      message: "Getting your categories for the month",
    });

    try {
      const response = await fetch(`/api/categories/${year}/${month}`);

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const fetchedCategories = await response.json();

      setCategories(fetchedCategories);

      setCategoriesRequest({ action: "get", status: "success", message: null });
    } catch (error) {
      setCategoriesRequest({
        action: "get",
        status: "error",
        message: error.message,
      });
    }
  };

  // Get the total budget, actual and remaining values for both fixed and variable categories
  const categoryTotals = useMemo(() => {
    if (!categories) {
      return null;
    }

    const totals = categories.reduce(
      (sum, category) => {
        const categoryBudget = dollarsToCents(category.budget);
        const categoryActual = dollarsToCents(category.actual);

        if (category.fixed && category.subcategories.length > 0) {
          category.subcategories.forEach((subcategory) => {
            const subcategoryActual = dollarsToCents(subcategory.actual);
            const subcategoryBudget = dollarsToCents(subcategory.budget);

            sum.categoryBudget += subcategoryBudget;
            sum.categoryActuals += subcategoryActual;
            sum.fixedActual += subcategoryActual;
            sum.fixedBudget += subcategoryBudget;
          });
        } else if (category.fixed && category.subcategories.length === 0) {
          sum.categoryBudget += categoryBudget;
          sum.fixedBudget += categoryBudget;

          sum.categoryActuals += categoryActual;
          sum.fixedActual += categoryActual;
        } else {
          sum.categoryBudget += categoryBudget;
          sum.variableBudget += categoryBudget;
          sum.categoryActuals += categoryActual;
          sum.variableActual += categoryActual;
        }

        return sum;
      },
      {
        categoryBudget: 0,
        categoryActuals: 0,
        fixedBudget: 0,
        fixedActual: 0,
        variableBudget: 0,
        variableActual: 0,
      },
    );

    const variableRemaining = totals.variableBudget - totals.variableActual;

    return {
      budget: centsToDollars(totals.categoryBudget),
      actual: centsToDollars(totals.categoryActuals),
      fixedBudget: centsToDollars(totals.fixedBudget),
      fixedActual: centsToDollars(totals.fixedActual),
      variableBudget: centsToDollars(totals.variableBudget),
      variableActual: centsToDollars(totals.variableActual),
      variableRemaining: centsToDollars(variableRemaining),
    };
  }, [categories]);

  // Define all the category and subcategory's correlating colors
  const categoryColors = useMemo(() => {
    if (!categories) {
      return null;
    }

    const colors = {};

    categories.forEach((category) => {
      if (category.subcategories.length === 0) {
        colors[category.name] = category.color;
      } else {
        category.subcategories.forEach((subcategory) => {
          colors[subcategory.name] = category.color;
        });
      }
    });

    return colors;
  }, [categories]);

  // Create a set of the user's categories so a user cannot create a category with the same name
  const categoryNames = useMemo(() => {
    if (!categories) {
      return null;
    }

    const names = new Set();

    categories.forEach((category) => {
      names.add(category.name);

      category.subcategories.forEach((subcategory) => {
        names.add(subcategory.name);
      });
    });

    return names;
  }, [categories]);

  return {
    categories,
    categoriesRequest,
    categoryTotals,
    categoryColors,
    categoryNames,
  };
};

export default useCategories;
