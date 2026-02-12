import { useEffect, useState } from "react";

const usePreviousCategories = (month, year) => {
  const [previousCategories, setPreviousCategories] = useState([]);
  const [previousCategoriesLoading, setPreviousCategoriesLoading] =
    useState(true);

  useEffect(() => {
    const getPreviousCategories = async () => {
      try {
        const response = await fetch(
          `/api/categories/previous/${year}/${month}`,
        );

        if (response.ok) {
          const fetchedPreviousCategories = await response.json();
          setPreviousCategories(fetchedPreviousCategories);
        } else {
          const message = await response.text();

          throw new Error(message);
        }
      } catch (error) {
        setPreviousCategories(null);

        console.error(error);
      } finally {
        setPreviousCategoriesLoading(false);
      }
    };

    getPreviousCategories();
  }, []);

  return { previousCategories, previousCategoriesLoading };
};

export default usePreviousCategories;
