import dateSorter from "@/helpers/dateSorter";
import { useEffect, useState } from "react";

const usePaystubs = (username, year) => {
    const [paystubs, setPaystubs] = useState([]);
    const [paystubsLoading, setPaystubsLoading] = useState(true);
    
    // GET request that returns all the paystubs based on the username and year
    useEffect(() => {
        const getPaystubs = async () => {
            try {
                const rsp = await fetch(`/api/paystubs/${username}/${year}`);
                const result = await rsp.json();
                const sortedPaystubs = dateSorter(result);
                setPaystubs(sortedPaystubs);
                setPaystubsLoading(false);
            } catch (err) {
                console.log("Error occured while retrieving paystubs: ", err);
            }
        }

        getPaystubs();
    }, [username, year]);

    // POST request that adds a new paystub based on the username and year
    // Then it sets the paystubs array to the array returned by the response
    const postPaystub = async (newPaystub) => {
        try {
            const rsp = await fetch(`/api/paystubs/${username}/${year}`, {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newPaystub)
            });

            const result = await rsp.json();
            const sortedPaystubs = dateSorter(result);
            setPaystubs(sortedPaystubs);
            setPaystubsLoading(false);
        } catch (err) {
            console.log("Error occurred while adding a paystub: ", err);
        }
    };

    // PUT request that updates a paystub based on the username and year
    // Then it sets the paystubs array to the new response array
    const putPaystub = async (edittedPaystub) => {
        try {
            const rsp = await fetch(`/api/paystubs/${username}/${year}`, {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(edittedPaystub)
            });

            const result = await rsp.json();
            const sortedPaystubs = dateSorter(result);
            setPaystubs(sortedPaystubs);
            setPaystubsLoading(false);
        } catch (err) {
            console.log("Error occurred while updating paystubs: ", err);
        }
    };

    // DELETE request that deletes a paystub based on the username and year
    // Then it sets the paystubs array to the new response array
    const deletePaystub = async (paystubToDelete) => {
        try {
            const rsp = await fetch(`/api/paystubs/${username}/${year}`, {
                method: "DELETE",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paystubToDelete)
            });

            const result = await rsp.json();
            const sortedPaystubs = dateSorter(result);
            setPaystubs(sortedPaystubs);
            setPaystubsLoading(false);
        } catch (err) {
            console.log("Error occurred while deleting a paystub: ", err);
        }
    };

    // Function that returns a user's income for a given month
    const getMonthIncome = (monthInfo) => {
        let totalIncome = 0;

        // Checks each paystub to see if it falls within the month and year given
        paystubs.map(paystub => {
            const paystubDate = new Date(paystub.date);
            const paystubMonth = paystubDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
            const paystubYear = paystubDate.getFullYear();
            if (paystubMonth === monthInfo.month && paystubYear === monthInfo.year)
                totalIncome += paystub.net;
        });
        
        return totalIncome;
    }
    
    return { paystubs, paystubsLoading, postPaystub, putPaystub, deletePaystub, getMonthIncome };
};

export default usePaystubs;