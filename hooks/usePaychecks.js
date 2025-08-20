import { useCallback, useEffect, useState } from "react";

const usePaychecks = (year) => {
  const [paychecks, setPaychecks] = useState([]);
  const [paychecksLoading, setPaychecksLoading] = useState(true);

  // GET request that returns all the paychecks based on the year
  useEffect(() => {
    const getPaychecks = async () => {
      try {
        const rsp = await fetch(`/api/paychecks/${year}`);

        if (rsp.ok) {
          const fetchedPaychecks = await rsp.json();
          setPaychecks(fetchedPaychecks);
        } else {
          const message = await rsp.text();
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

  // POST request that adds a new paycheck based on the month and year
  const postPaycheck = useCallback(
    async (newPaycheck) => {
      try {
        const rsp = await fetch(`/api/paychecks/${year}`, {
          method: "POST",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPaycheck),
        });

        if (rsp.ok) {
          const addedPaycheck = await rsp.json();
          setPaychecks([...paychecks, addedPaycheck]);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setPaychecksLoading(false);
      }
    },
    [paychecks, year]
  );

  // PUT request that updates a paycheck based on the id
  const putPaycheck = useCallback(
    async (edittedPaycheck) => {
      try {
        const rsp = await fetch(`/api/paycheck/${edittedPaycheck.id}`, {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(edittedPaycheck),
        });

        if (rsp.ok) {
          const updatedPaycheck = await rsp.json();

          const updatedPaychecks = paychecks.map((paycheck) => {
            if (paycheck.id === updatedPaycheck.id) {
              return updatedPaycheck;
            } else {
              return paycheck;
            }
          });

          setPaychecks(updatedPaychecks);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setPaychecksLoading(false);
      }
    },
    [paychecks]
  );

  // DELETE request that deletes a paycheck based on the id
  const deletePaycheck = useCallback(
    async (paycheckToDelete) => {
      try {
        const rsp = await fetch(`/api/paycheck/${paycheckToDelete.id}`, {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paycheckToDelete),
        });

        if (rsp.ok) {
          const deletedPaycheck = await rsp.json();

          const updatedPaychecks = paychecks.filter((paycheck) => {
            return paycheck.id !== deletedPaycheck.id;
          });

          setPaychecks(updatedPaychecks);
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        // Send the error back to the component to show the user
        throw new Error(error);
      } finally {
        setPaychecksLoading(false);
      }
    },
    [paychecks]
  );

  // Function that returns a user's total paychecks for a given month
  const getMonthIncome = useCallback(
    (monthInfo) => {
      let totalIncome = 0;

      if (paychecks) {
        // Checks each paycheck to see if it falls within the month and year given
        paychecks.forEach((paycheck) => {
          // Added a time component to the paycheck date avoid the automatic UTC timezone conversion
          const paycheckDate = new Date(paycheck.date + "T00:00:00");
          const paycheckMonth = paycheckDate.toLocaleString("default", {
            month: "long",
          });
          const paycheckYear = paycheckDate.getFullYear();

          // If the paycheck month and year matches the given month, then include that paycheck for the month
          if (
            paycheckMonth === monthInfo.month &&
            paycheckYear === monthInfo.year
          )
            totalIncome += paycheck.net;
        });

        return totalIncome;
      } else {
        return null;
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
    getMonthIncome,
  };
};

export default usePaychecks;
