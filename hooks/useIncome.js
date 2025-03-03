import dateSorter from "@/helpers/dateSorter";
import { useEffect, useState } from "react";

const useIncome = (username, year) => {
    const [income, setIncome] = useState([]);
    const [incomeLoading, setIncomeLoading] = useState(true);
    
    // GET request that returns all the income based on the username and year
    useEffect(() => {
        const getIncome = async () => {
            try {
                const rsp = await fetch(`/api/income/${username}/${year}`);
                const result = await rsp.json();
                const sortedIncome = dateSorter(result);
                setIncome(sortedIncome);
                setIncomeLoading(false);
            } catch (err) {
                console.log("Error occured while retrieving income: ", err);
            }
        }

        getIncome();
    }, [username, year]);

    // POST request that adds a new paycheck based on the username and year
    // Then it sets the income array to the array returned by the response
    const postIncome = async (newPaycheck) => {
        try {
            const rsp = await fetch(`/api/income/${username}/${year}`, {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newPaycheck)
            });

            const result = await rsp.json();
            const sortedIncome = dateSorter(result);
            setIncome(sortedIncome);
            setIncomeLoading(false);
        } catch (err) {
            console.log("Error occurred while adding a paycheck: ", err);
        }
    };

    // PUT request that updates a paycheck based on the username and year
    // Then it sets the income array to the new response array
    const putIncome = async (edittedPaycheck) => {
        try {
            const rsp = await fetch(`/api/income/${username}/${year}`, {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(edittedPaycheck)
            });

            const result = await rsp.json();
            const sortedIncome = dateSorter(result);
            setIncome(sortedIncome);
            setIncomeLoading(false);
        } catch (err) {
            console.log("Error occurred while updating income: ", err);
        }
    };

    // DELETE request that deletes a paycheck based on the username and year
    // Then it sets the income array to the new response array
    const deleteIncome = async (paycheckToDelete) => {
        try {
            const rsp = await fetch(`/api/income/${username}/${year}`, {
                method: "DELETE",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paycheckToDelete)
            });

            const result = await rsp.json();
            const sortedIncome = dateSorter(result);
            setIncome(sortedIncome);
            setIncomeLoading(false);
        } catch (err) {
            console.log("Error occurred while deleting a paycheck: ", err);
        }
    };

    // Function that returns a user's income for a given month
    const getMonthIncome = (monthInfo) => {
        let totalIncome = 0;

        // Checks each paycheck to see if it falls within the month and year given
        income.map(paycheck => {
            // Added a time component to the paycheck date avoid the automatic UTC timezone conversion
            const paycheckDate = new Date(paycheck.date+"T00:00:00");
            const paycheckMonth = paycheckDate.toLocaleString('default', {month: 'long'});
            const paycheckYear = paycheckDate.getFullYear();

            // If the paycheck month and year matches the given month, then include that income for the month
            if (paycheckMonth === monthInfo.month && paycheckYear === monthInfo.year)
                totalIncome += paycheck.net;
        });
        
        return totalIncome;
    }
    
    return { income, incomeLoading, postIncome, putIncome, deleteIncome, getMonthIncome };
};

export default useIncome;