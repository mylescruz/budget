import { useCallback, useEffect, useState } from "react";

const usePaychecks = (year) => {
  const [paychecks, setPaychecks] = useState([]);
  const [paychecksLoading, setPaychecksLoading] = useState(true);

  useEffect(() => {
    const getPaychecks = async () => {
      try {
        const response = await fetch(`/api/paychecks/${year}`);

        if (response.ok) {
          const fetchedPaychecks = await response.json();
          setPaychecks(fetchedPaychecks);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        setPaychecks(null);
        console.error(error);
      } finally {
        setPaychecksLoading(false);
      }
    };

    getPaychecks();
  }, [year]);

  const postPaycheck = useCallback(
    async (paycheck) => {
      try {
        const response = await fetch(`/api/paychecks/${year}`, {
          method: "POST",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paycheck),
        });

        if (response.ok) {
          const addedPaycheck = await response.json();
          setPaychecks([...paychecks, addedPaycheck]);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        throw new Error(error);
      } finally {
        setPaychecksLoading(false);
      }
    },
    [paychecks, year]
  );

  const putPaycheck = useCallback(
    async (paycheck) => {
      try {
        const response = await fetch(`/api/paycheck/${paycheck._id}`, {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paycheck),
        });

        if (response.ok) {
          const updatedPaycheck = await response.json();

          const updatedPaychecks = paychecks.map((paycheck) => {
            if (paycheck._id === updatedPaycheck._id) {
              return updatedPaycheck;
            } else {
              return paycheck;
            }
          });

          setPaychecks(updatedPaychecks);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        throw new Error(error);
      } finally {
        setPaychecksLoading(false);
      }
    },
    [paychecks]
  );

  const deletePaycheck = useCallback(
    async (paycheck) => {
      try {
        const response = await fetch(`/api/paycheck/${paycheck._id}`, {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paycheck),
        });

        if (response.ok) {
          const deletedPaycheck = await response.json();

          const updatedPaychecks = paychecks.filter((paycheck) => {
            return paycheck._id !== deletedPaycheck._id;
          });

          setPaychecks(updatedPaychecks);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        throw new Error(error);
      } finally {
        setPaychecksLoading(false);
      }
    },
    [paychecks]
  );

  return {
    paychecks,
    paychecksLoading,
    postPaycheck,
    putPaycheck,
    deletePaycheck,
  };
};

export default usePaychecks;
