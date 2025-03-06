import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const useTransactions = (username, month, year) => {
    const [transactions, setTransactions] = useState([]);
    const router = useRouter();

    // GET request that returns the user's transaction based on the username, year and month
    useEffect(() => {
        const getTransactions = async () => {
            try {
                const rsp = await fetch(`/api/transactions/${username}/${year}/${month}`);

                if (rsp.ok) {
                    const result = await rsp.json();
                    setTransactions(result);
                } else {
                    const message = await rsp.text();
                    throw new Error(message);
                }
            } catch (error) {
                router.push({
                    pathname: '/error',
                    query: {message: error.message}
                });
            }
        }
        getTransactions();
    }, [username, month, year, router]);

    // POST request that adds a new transaction based on the username, year and month
    // Then it sets the transactions array to the array returned by the response
    const postTransaction = async (newTransaction) => {
        const date = new Date(newTransaction.date);
        const month = date.toLocaleDateString('en-US', {month: 'long', timeZone: 'UTC'});

        try {
            const rsp = await fetch(`/api/transactions/${username}/${year}/${month}`, {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newTransaction)
            });

            if (rsp.ok) {
                const result = await rsp.json();
                setTransactions(result);
            } else {
                const message = await rsp.text();
                throw new Error(message);
            }
        } catch (error) {
            redirectToErrorPage(error);
        }
    };

    // PUT request that updates a transaction based on the username, year and month
    // Then it sets the transactions array to the array returned by the response
    const putTransaction = async (edittedTransaction) => {
        try {
            const rsp = await fetch(`/api/transactions/${username}/${year}/${month}`, {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(edittedTransaction)
            });

            if (rsp.ok) {
                const result = await rsp.json();
                setTransactions(result);
            } else {
                const message = await rsp.text();
                throw new Error(message);
            }
        } catch (error) {
            redirectToErrorPage(error);
        }
    };

    // DELETE request that deletes a transaction based on the username, year and month
    // Then it sets the transactions array to the array returned by the response
    const deleteTransaction = async (transactionToDelete) => {
        const date = new Date(transactionToDelete.date);
        const month = date.toLocaleDateString('en-US', {month: 'long', timeZone: 'UTC'});

        try {
            const rsp = await fetch(`/api/transactions/${username}/${year}/${month}`, {
                method: "DELETE",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transactionToDelete)
            });

            if (rsp.ok) {
                const result = await rsp.json();
                setTransactions(result);
            } else {
                const message = await rsp.text();
                throw new Error(message);
            }
        } catch (error) {
            redirectToErrorPage(error);
        }
    };

    const redirectToErrorPage = ( error ) => {
        router.push({
            pathname:'/error', 
            query: {message: error.message}
        });
    };
    
    return { transactions, postTransaction, putTransaction, deleteTransaction };
};

export default useTransactions;