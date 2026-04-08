import { useCallback, useEffect, useState } from "react";

const usePreviousCategories = (month, year) => {
  const [previousCategories, setPreviousCategories] = useState([]);
  const [previousCategoriesLoading, setPreviousCategoriesLoading] =
    useState(true);
  const [previousCategoriesRequest, setPreviousCategoriesRequest] = useState({
    action: null, //  get | null
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getPreviousCategories(month, year);
  }, [month, year]);

  const getPreviousCategories = useCallback(async (month, year) => {
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
      setPreviousCategories(null);

      setPreviousCategoriesRequest({
        action: "get",
        status: "error",
        message: error.message,
      });

      console.error(error);
    } finally {
      setPreviousCategoriesLoading(false);
    }
  }, []);

  return {
    previousCategories,
    previousCategoriesLoading,
    previousCategoriesRequest,
  };
};

export default usePreviousCategories;
