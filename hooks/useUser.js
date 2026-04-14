import { useEffect, useState } from "react";

// Fetches and returns the current user's basic profile information.
//
// Return value:
// {
//   name: string,             // full name of the user
//   username: string,         // unique username
//   email: string,            // email address
//   role: string,             // "Admin" | "User"
//   createdTS: string,        // account creation date
//   onboarded: boolean        // true if user has completed onboarding
// }

const useUser = () => {
  const [user, setUser] = useState(null);
  const [userRequest, setUserRequest] = useState({
    action: "get", // get | update | delete
    status: "loading", // loading | success | error
    message: "Getting your account details",
  });

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    setUserRequest({
      action: "get",
      status: "loading",
      message: "Getting your account details",
    });

    try {
      const response = await fetch("/api/user");

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const fetchedUser = await response.json();
      setUser(fetchedUser);

      setUserRequest({
        action: "get",
        status: "success",
        message: null,
      });
    } catch (error) {
      setUserRequest({
        action: "get",
        status: "error",
        message: error.message,
      });

      console.error(error);
    }
  };

  const putUser = async (editedUser) => {
    setUserRequest({
      action: "update",
      status: "loading",
      message: "Updating your account details",
    });

    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const updatedUser = await response.json();
      setUser(updatedUser);

      setUserRequest({
        action: "update",
        status: "success",
        message: "Successfully updated your account!",
      });
    } catch (error) {
      setUserRequest({
        action: "update",
        status: "error",
        message: error.message,
      });

      // Send the error back to the component to show the user
      throw new Error(error.message);
    }
  };

  // DELETE request that deletes a user based on their id
  const deleteUser = async (deletedUser) => {
    setUserRequest({
      action: "delete",
      status: "loading",
      message: "Deleting your account and all your data",
    });

    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deletedUser),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      setUser(null);

      setUserRequest({
        action: "delete",
        status: "success",
        message: "You have successfully deleted your account!",
      });
    } catch (error) {
      setUserRequest({
        action: "delete",
        status: "error",
        message: error.message,
      });

      // Send the error back to the component to show the user
      throw new Error(error.message);
    }
  };

  return { user, userRequest, putUser, deleteUser };
};

export default useUser;
