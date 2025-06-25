import categorySorter from "@/helpers/categorySorter";
import { useCallback, useEffect, useState } from "react";

const useCategories = (username, month, year) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // GET request that returns all the categories based on the username, year and month
  useEffect(() => {
    const getCategories = async () => {
      try {
        const rsp = await fetch(`/api/categories/${username}/${year}/${month}`);

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
    };

    getCategories();
  }, [username, month, year]);

  // POST request that adds a new category based on the username, year and month
  // Then it sets the categories array to the array returned by the response
  const postCategory = useCallback(
    async (newCategory) => {
      try {
        const rsp = await fetch(
          `/api/categories/${username}/${year}/${month}`,
          {
            method: "POST",
            headers: {
              Accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newCategory),
          }
        );

        if (rsp.ok) {
          const addedCategory = await rsp.json();
          setCategories(categorySorter([...categories, addedCategory]));
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
    },
    [categories, username, year, month]
  );

  // PUT request that updates all the categories based on the username, year and month
  // Then it sets the categories array to the array returned by the response
  const putCategories = useCallback(
    async (edittedCategories) => {
      try {
        const rsp = await fetch(
          `/api/categories/${username}/${year}/${month}`,
          {
            method: "PUT",
            headers: {
              Accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(edittedCategories),
          }
        );

        if (rsp.ok) {
          const updatedCategories = await rsp.json();
          setCategories(categorySorter(updatedCategories));
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
    },
    [username, year, month]
  );

  // DELETE request that deletes a category based on the username, year and month
  // Then it sets the categories array to the array returned by the response
  const deleteCategory = useCallback(
    async (categoryToDelete) => {
      try {
        const rsp = await fetch(
          `/api/categories/${username}/${year}/${month}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(categoryToDelete),
          }
        );

        if (rsp.ok) {
          const deletedCategory = await rsp.json();
          const updatedCategories = categories.filter((category) => {
            return category.id !== deletedCategory.id;
          });
          setCategories(categorySorter(updatedCategories));
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
    },
    [categories, username, year, month]
  );

  return {
    categories,
    categoriesLoading,
    postCategory,
    putCategories,
    deleteCategory,
  };
};

export default useCategories;
