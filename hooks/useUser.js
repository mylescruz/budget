import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

const useUser = () => {
  const [user, setUser] = useState({});
  const [userLoading, setUserLoading] = useState(false);
  const { data: session } = useSession();

  // GET request that gets a user based on their id
  useEffect(() => {
    const getUser = async () => {
      try {
        setUserLoading(true);
        const response = await fetch(`/api/user/${session.user.id}`);

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
  }, [session]);

  // PUT request that updates a user based on their id
  const putUser = useCallback(
    async (edittedUser) => {
      try {
        const response = await fetch(`/api/user/${session.user.id}`, {
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
          setUserLoading(false);
        } else {
          setUserLoading(false);
          const result = await response.text();
          throw new Error(result);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [session]
  );

  // DELETE request that deletes a user based on their id
  const deleteUser = useCallback(async (deletedUser) => {
    try {
      const response = await fetch(`/api/user/${deletedUser.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deletedUser),
      });

      if (response.ok) {
        setUser(null);
        setUserLoading(false);
      } else {
        setUserLoading(false);
        const result = await response.text();
        throw new Error(result);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  return { user, userLoading, putUser, deleteUser };
};

export default useUser;
