import categorySorter from "@/helpers/categorySorter";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const useCategories = (username, month, year) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const router = useRouter();

  // GET request that returns all the categories based on the username, year and month
  useEffect(() => {
    const getCategories = async () => {
      try {
        const rsp = await fetch(`/api/categories/${username}/${year}/${month}`);

        if (rsp.ok) {
          const result = await rsp.json();
          setCategories(categorySorter(result));
          setCategoriesLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        router.push({
          pathname: "/error",
          query: { message: error.message },
        });
      }
    };

    getCategories();
  }, [username, month, year, router]);

  const redirectToErrorPage = useCallback(
    (error) => {
      router.push({
        pathname: "/error",
        query: { message: error.message },
      });
    },
    [router]
  );

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
          const result = await rsp.json();
          setCategories(categorySorter(result));
          setCategoriesLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [username, year, month, redirectToErrorPage]
  );

  // PUT request that updates all the categories based on the username, year and month
  // Then it sets the categories array to the array returned by the response
  const putCategories = useCallback(
    async (updatedCategories) => {
      try {
        const rsp = await fetch(
          `/api/categories/${username}/${year}/${month}`,
          {
            method: "PUT",
            headers: {
              Accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedCategories),
          }
        );

        if (rsp.ok) {
          const result = await rsp.json();
          setCategories(categorySorter(result));
          setCategoriesLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [username, year, month, redirectToErrorPage]
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
          const result = await rsp.json();
          setCategories(categorySorter(result));
          setCategoriesLoading(false);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        redirectToErrorPage(error);
      }
    },
    [username, year, month, redirectToErrorPage]
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
