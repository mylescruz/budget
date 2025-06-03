import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await fetch("/api/admin/users");

        if (response.ok) {
          const result = await response.json();
          setUsers(result);
          setUsersLoading(false);
        } else {
          setUsersLoading(false);
          const result = await response.text();
          throw new Error(result);
        }
      } catch (error) {
        console.error(error);
        router.push({
          pathname: "/error",
          query: { message: error.message },
        });
      }
    };

    getUsers();
  }, [router]);

  const postUser = useCallback(
    async (newUser) => {
      try {
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        });

        if (response.ok) {
          const result = await response.json();
          setUsers(result);
        } else {
          const result = await response.text();
          throw new Error(result);
        }
      } catch (error) {
        console.error(error);
        router.push({
          pathname: "/error",
          query: { message: error.message },
        });
      }
    },
    [router]
  );

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
          const result = await response.json();
          setUsers(result);
        } else {
          const result = await response.text();
          throw new Error(result);
        }
      } catch (error) {
        console.error(error);
        router.push({
          pathname: "/error",
          query: { message: error.message },
        });
      }
    },
    [router]
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
          const result = await response.json();
          setUsers(result);
        } else {
          const result = await response.text();
          throw new Error(result);
        }
      } catch (error) {
        console.error(error);
        router.push({
          pathname: "/error",
          query: { message: error.message },
        });
      }
    },
    [router]
  );

  return { users, usersLoading, postUser, putUser, deleteUser };
};

export default useUsers;
