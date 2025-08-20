import { useCallback, useEffect, useState } from "react";

const useUser = () => {
  const [user, setUser] = useState({});
  const [userLoading, setUserLoading] = useState(false);

  // GET request that gets a user based on their id
  useEffect(() => {
    const getUser = async () => {
      try {
        setUserLoading(true);
        const response = await fetch("/api/user");

        if (response.ok) {
          const result = await response.json();
          setUser(result);
        } else {
          const result = await response.text();
          throw new Error(result);
        }
      } catch (error) {
        setUser(null);
        console.error(error);
      } finally {
        setUserLoading(false);
      }
    };

    getUser();
  }, []);

  // PUT request that updates a user based on their id
  const putUser = useCallback(async (edittedUser) => {
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(edittedUser),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      } else {
        const message = await response.text();
        throw new Error(message);
      }
    } catch (error) {
      // Send the error back to the component to show the user
      throw new Error(error.message);
    } finally {
      setUserLoading(false);
    }
  }, []);

  // DELETE request that deletes a user based on their id
  const deleteUser = useCallback(async (deletedUser) => {
    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deletedUser),
      });

      if (response.ok) {
        setUser(null);
      } else {
        const result = await response.text();
        throw new Error(result);
      }
    } catch (error) {
      // Send the error back to the component to show the user
      throw new Error(error.message);
    } finally {
      setUserLoading(false);
    }
  }, []);

  return { user, userLoading, putUser, deleteUser };
};

export default useUser;
