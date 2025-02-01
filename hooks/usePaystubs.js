import dateSorter from "@/helpers/dateSorter";
import { useEffect, useState } from "react";

const usePaystubs = (year) => {
    const [paystubs, setPaystubs] = useState([]);
    
    useEffect(() => {
        const getPaystubs = async () => {
            try {
                const rsp = await fetch(`/api/paystubs/${year}`);
                const result = await rsp.json();
                const sortedPaystubs = dateSorter(result);
                setPaystubs(sortedPaystubs);
            } catch (err) {
                console.log("Error occured while retrieving paystubs: ", err);
            }
        }

        getPaystubs();
    }, [year]);

    const postPaystub = async (newPaystub) => {
        try {
            const rsp = await fetch(`/api/paystubs/${year}`, {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newPaystub)
            });

            const result = rsp.json();
            setPaystubs(result);
        } catch (err) {
            console.log("Error occurred while adding a paystub: ", err);
        }
    };

    const putPaystub = async (edittedPaystub) => {
        try {
            const rsp = await fetch(`/api/paystubs/${year}`, {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(edittedPaystub)
            });

            const result = rsp.json();
            setPaystubs(result);
        } catch (err) {
            console.log("Error occurred while updating paystubs: ", err);
        }
    };

    const deletePaystub = async (paystubToDelete) => {
        try {
            const rsp = await fetch(`/api/paystubs/${year}`, {
                method: "DELETE",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paystubToDelete)
            });

            const result = rsp.json();
            setPaystubs(result);
        } catch (err) {
            console.log("Error occurred while deleting a paystub: ", err);
        }
    };

    const getMonthIncome = (givenMonth) => {
        let totalIncome = 0;

        paystubs.map(paystub => {
            const paystubDate = new Date(paystub.date);
            const paystubMonth = paystubDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
            if (paystubMonth === givenMonth)
                totalIncome += paystub.net;
        });
        
        return totalIncome;
    }
    
    return { paystubs, postPaystub, putPaystub, deletePaystub, getMonthIncome };
};

export default usePaystubs;