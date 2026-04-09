import { useEffect, useState } from "react";

// Fetches and returns all users in the system.
//
// Return value:
// [
//   {
//     id: string,               // unique identifier for the user
//     name: string,             // full name of the user
//     username: string,         // unique username
//     email: string,            // email address
//     role: string,             // "Admin", "User")
//     created_date: string,     // account creation date
//     onboarded: boolean        // true if user has completed onboarding
//   }
// ]

const useUsers = () => {
  const [users, setUsers] = useState(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersRequest, setUsersRequest] = useState({
    action: null, //  get | update | delete | null
    status: "idle", // idle | loading | success | error
    message: null,
  });

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    setUsersRequest({
      action: "get",
      status: "loading",
      message: "Getting all the Type-A Budget users",
    });

    try {
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const fetchedUsers = await response.json();

      setUsers(fetchedUsers);

      setUsersRequest({
        action: "get",
        status: "success",
        message: null,
      });
    } catch (error) {
      setUsersRequest({
        action: "get",
        status: "error",
        message: error.message,
      });

      console.error(error);
    } finally {
      setUsersLoading(false);
    }
  };

  const putUser = async (editedUser) => {
    setUsersRequest({
      action: "update",
      status: "loading",
      message: "Updating this user's details",
    });

    try {
      const response = await fetch("/api/admin/users", {
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

      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === updatedUser.id) {
            return updatedUser;
          }

          return user;
        }),
      );

      setUsersRequest({
        action: "update",
        status: "success",
        message: null,
      });
    } catch (error) {
      setUsersRequest({
        action: "update",
        status: "error",
        message: error.message,
      });

      console.error(error);
    } finally {
      setUsersLoading(false);
    }
  };

  const deleteUser = async (userToDelete) => {
    setUsersRequest({
      action: "delete",
      status: "loading",
      message: "Deleting this user's account from Type-A Budget",
    });

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userToDelete),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const deletedUser = await response.json();

      setUsers((prev) =>
        prev.filter((user) => {
          return user.id !== deletedUser.id;
        }),
      );

      setUsersRequest({
        action: "delete",
        status: "success",
        message: null,
      });
    } catch (error) {
      setUsersRequest({
        action: "delete",
        status: "error",
        message: error.message,
      });

      console.error(error);
    } finally {
      setUsersLoading(false);
    }
  };

  return { users, usersLoading, usersRequest, putUser, deleteUser };
};

export default useUsers;
