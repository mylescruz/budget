import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

const useUser = () => {
  const [user, setUser] = useState({});
  const [userLoading, setUserLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const getUser = async () => {
      try {
        setUserLoading(true);
        const response = await fetch(`/api/user/${session.user.username}`);

        if (response.ok) {
          const result = await response.json();
          setUser(result);
          setUserLoading(false);
        } else {
          setUserLoading(false);
          const result = await response.text();
          throw new Error(result);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getUser();
  }, [session.user.username]);

  const postUser = useCallback(async (newUser) => {
    try {
      const response = await fetch(`/api/user/${newUser.username}`, {
        method: "POST",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result);
      } else {
        const result = await response.text();
        throw new Error(result);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const putUser = useCallback(
    async (edittedUser) => {
      try {
        const response = await fetch(`/api/user/${session.user.username}`, {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(edittedUser),
        });

        if (response.ok) {
          const result = await response.json();
          setUser(result);
        } else {
          const result = await response.text();
          throw new Error(result);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [session]
  );

  const deleteUser = useCallback(async (deletedUser) => {
    try {
      const response = await fetch(`/api/user/${deletedUser.username}`, {
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
      console.error(error);
    }
  }, []);

  return { user, userLoading, postUser, putUser, deleteUser };
};

export default useUser;
