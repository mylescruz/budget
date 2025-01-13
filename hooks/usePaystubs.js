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
            await fetch(`/api/paystubs/${year}`, {
                method: "POST",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newPaystub)
            });
        } catch (err) {
            console.log("Error occurred while adding a paystub: ", err);
        }
    };

    const putPaystub = async (edittedPaystub) => {
        try {
            await fetch(`/api/paystubs/${year}`, {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(edittedPaystub)
            });
        } catch (err) {
            console.log("Error occurred while updating paystubs: ", err);
        }
    };

    const deletePaystub = async (paystubToDelete) => {
        try {
            await fetch(`/api/paystubs/${year}`, {
                method: "DELETE",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paystubToDelete)
            });
        } catch (err) {
            console.log("Error occurred while deleting a paystub: ", err);
        }
    };

    const addNewPaystub = (newPaystub) => {
        postPaystub(newPaystub);
        setPaystubs([...paystubs, newPaystub]);
    };

    const updatePaystub = (edittedPaystub) => {
        putPaystub(edittedPaystub);

        const updatedPaystubs = paystubs.map(paystub => {
            if (paystub.id === edittedPaystub.id)
                return edittedPaystub;
            else
                return paystub;
        });

        setPaystubs(updatedPaystubs);
    };

    const deleteFromPaystubs = (paystubToDelete) => {
        deletePaystub(paystubToDelete);

        const updatedPaystubs = paystubs.filter(paystub => {
            return paystub.id !== paystubToDelete.id;
        });
        setPaystubs(updatedPaystubs);
    };

    const getTotalIncome = (givenMonth) => {
        let totalIncome = 0;

        paystubs.map(paystub => {
            const paystubDate = new Date(paystub.date);
            const paystubMonth = paystubDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
            if (paystubMonth === givenMonth)
                totalIncome += paystub.net;
        });
        
        return totalIncome;
    }
    
    return { paystubs, addNewPaystub, updatePaystub, deleteFromPaystubs, getTotalIncome };
};

export default usePaystubs;