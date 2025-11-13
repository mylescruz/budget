import categorySorter from "@/helpers/categorySorter";
import { useCallback, useEffect, useState } from "react";

const useCategories = (month, year) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const getCategories = useCallback(async (month, year) => {
    try {
      const rsp = await fetch(`/api/categories/${year}/${month}`);

      if (rsp.ok) {
        const fetchedCategories = await rsp.json();
        setCategories(categorySorter(fetchedCategories));
      } else {
        const message = await rsp.text();
        throw new Error(message);
      }
    } catch (error) {
      console.error(error);
      setCategories(null);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // GET request that returns all the categories based on the month and year
  useEffect(() => {
    getCategories(month, year);
  }, [month, year, getCategories]);

  // POST request that adds a new category based on the month and year
  // Then it sets the categories array to the array returned by the response
  const postCategory = useCallback(
    async (newCategory) => {
      try {
        const rsp = await fetch(`/api/categories/${year}/${month}`, {
          method: "POST",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCategory),
        });

        if (rsp.ok) {
          const addedCategory = await rsp.json();
          setCategories(categorySorter([...categories, addedCategory]));
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setCategoriesLoading(false);
      }
    },
    [categories, year, month]
  );

  // Update a category in the database
  const putCategory = useCallback(
    async (updatedCategory) => {
      try {
        const rsp = await fetch(`/api/category/${updatedCategory._id}`, {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCategory),
        });

        if (rsp.ok) {
          const updatedCategory = await rsp.json();

          // Replace old category with new new category in array
          const updatedCategories = [...categories];

          const categoryIndex = updatedCategories.findIndex(
            (cat) => cat._id === updatedCategory._id
          );

          updatedCategories[categoryIndex] = updatedCategory;

          if (categoryIndex !== -1) {
            setCategories(updatedCategories);
          } else {
            throw new Error(`Could not find category ${updatedCategory.name}`);
          }
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setCategoriesLoading(false);
      }
    },
    [categories]
  );

  // DELETE request that deletes a category based on the username, year and month
  // Then it sets the categories array to the array returned by the response
  const deleteCategory = useCallback(
    async (category) => {
      try {
        const rsp = await fetch(`/api/category/${category.id}`, {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
        });

        if (rsp.ok) {
          const result = await rsp.json();

          const updatedCategories = categories.filter((category) => {
            return category.id !== result.id;
          });

          setCategories(categorySorter(updatedCategories));
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setCategoriesLoading(false);
      }
    },
    [categories]
  );

  return {
    categories,
    categoriesLoading,
    getCategories,
    postCategory,
    putCategory,
    deleteCategory,
  };
};

export default useCategories;
