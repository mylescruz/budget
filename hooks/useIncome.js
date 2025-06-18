import dateSorter from "@/helpers/dateSorter";
import { useCallback, useEffect, useState } from "react";

const useIncome = (username, year) => {
  const [income, setIncome] = useState([]);
  const [incomeLoading, setIncomeLoading] = useState(true);

  // GET request that returns all the income based on the username and year
  useEffect(() => {
    const getIncome = async () => {
      try {
        const rsp = await fetch(`/api/income/${username}/${year}`);

        if (rsp.ok) {
          const fetchedIncome = await rsp.json();
          setIncome(dateSorter(fetchedIncome));
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        setIncome(null);
        console.error(error);
      } finally {
        setIncomeLoading(false);
      }
    };

    getIncome();
  }, [username, year]);

  // POST request that adds a new paycheck based on the username and year
  // Then it sets the income array to the array returned by the response
  const postIncome = useCallback(
    async (newPaycheck) => {
      try {
        const rsp = await fetch(`/api/income/${username}/${year}`, {
          method: "POST",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPaycheck),
        });

        if (rsp.ok) {
          const addedPaycheck = await rsp.json();
          setIncome(dateSorter([...income, addedPaycheck]));
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        setIncome(null);
        console.error(error);
      } finally {
        setIncomeLoading(false);
      }
    },
    [income, username, year]
  );

  // PUT request that updates a paycheck based on the username and year
  // Then it sets the income array to the new response array
  const putIncome = useCallback(
    async (edittedPaycheck) => {
      try {
        const rsp = await fetch(`/api/income/${username}/${year}`, {
          method: "PUT",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(edittedPaycheck),
        });

        if (rsp.ok) {
          const updatedPaycheck = await rsp.json();

          const updatedIncome = income.map((paycheck) => {
            if (paycheck.id === updatedPaycheck.id) {
              return updatedPaycheck;
            } else {
              return paycheck;
            }
          });

          setIncome(dateSorter(updatedIncome));
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        setIncome(null);
        console.error(error);
      } finally {
        setIncomeLoading(false);
      }
    },
    [income, username, year]
  );

  // DELETE request that deletes a paycheck based on the username and year
  // Then it sets the income array to the new response array
  const deleteIncome = useCallback(
    async (paycheckToDelete) => {
      try {
        const rsp = await fetch(`/api/income/${username}/${year}`, {
          method: "DELETE",
          headers: {
            Accept: "application.json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paycheckToDelete),
        });

        if (rsp.ok) {
          const deletedPaycheck = await rsp.json();

          const updatedIncome = income.filter((paycheck) => {
            return paycheck.id !== deletedPaycheck.id;
          });

          setIncome(dateSorter(updatedIncome));
        } else {
          const message = await rsp.text();
          throw new Error(message);
        }
      } catch (error) {
        setIncome(null);
        console.error(error);
      } finally {
        setIncomeLoading(false);
      }
    },
    [income, username, year]
  );

  // Function that returns a user's income for a given month
  const getMonthIncome = useCallback(
    (monthInfo) => {
      let totalIncome = 0;

      if (income) {
        // Checks each paycheck to see if it falls within the month and year given
        income.forEach((paycheck) => {
          // Added a time component to the paycheck date avoid the automatic UTC timezone conversion
          const paycheckDate = new Date(paycheck.date + "T00:00:00");
          const paycheckMonth = paycheckDate.toLocaleString("default", {
            month: "long",
          });
          const paycheckYear = paycheckDate.getFullYear();

          // If the paycheck month and year matches the given month, then include that income for the month
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
    [income]
  );

  return {
    income,
    incomeLoading,
    postIncome,
    putIncome,
    deleteIncome,
    getMonthIncome,
  };
};

export default useIncome;
