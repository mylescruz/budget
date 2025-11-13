import { useEffect, useState } from "react";

const useYearTransactions = (year, category) => {
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  useEffect(() => {
    const getYearTransactions = async () => {
      try {
        const response = await fetch(
          `/api/yearTransactions/${year}/${category}`
        );

        if (response.ok) {
          const fetchedTransactions = await response.json();
          setTransactions(fetchedTransactions);
        } else {
          const message = await response.text();
          throw new Error(message);
        }
      } catch (error) {
        setTransactions(null);
        console.error(error);
      } finally {
        setTransactionsLoading(false);
      }
    };

    getYearTransactions();
  }, [year, category]);

  return { transactions, transactionsLoading };
};

export default useYearTransactions;
