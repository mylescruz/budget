import { useCallback, useEffect, useState } from "react";

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");

        if (response.ok) {
          const result = await response.json();
          setUsers(result);
        } else {
          const result = await response.text();
          throw new Error(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setUsersLoading(false);
      }
    };

    getUsers();
  }, []);

  const putUser = useCallback(
    async (edittedUser) => {
      try {
        const response = await fetch("/api/admin/users", {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(edittedUser),
        });

        if (response.ok) {
          const updatedUser = await response.json();

          const updatedUsers = users.map((user) => {
            if (user.id === updatedUser.id) {
              return updatedUser;
            }

            return user;
          });

          setUsers(updatedUsers);
        } else {
          const result = await response.text();
          throw new Error(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setUsersLoading(false);
      }
    },
    [users]
  );

  const deleteUser = useCallback(
    async (deletedUser) => {
      try {
        const response = await fetch("/api/admin/users", {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deletedUser),
        });

        if (response.ok) {
          const deletedUser = await response.json();

          const updatedUsers = users.filter((user) => {
            return user.id !== deletedUser.id;
          });

          setUsers(updatedUsers);
          setUsersLoading(false);
        } else {
          const result = await response.text();
          throw new Error(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setUsersLoading(false);
      }
    },
    [users]
  );

  return { users, usersLoading, putUser, deleteUser };
};

export default useUsers;
