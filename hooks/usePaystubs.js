import { useEffect, useState } from "react";

const usePaystubs = (year) => {
    const [paystubs, setPaystubs] = useState([]);
    
    useEffect(() => {
        const getPaystubs = async () => {
            try {
                const rsp = await fetch(`/api/paystubs/${year}`);
                const result = await rsp.json();
                setPaystubs(result);
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

    const putPaystubs = async (updatedPaystubs) => {
        try {
            await fetch(`/api/paystubs/${year}`, {
                method: "PUT",
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedPaystubs)
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

    const updatePaystubs = (updatedPaystubs) => {
        putPaystubs(updatedPaystubs);
        setPaystubs(updatedPaystubs);
    };

    const deleteFromPaystubs = (paystubToDelete) => {
        deletePaystub(paystubToDelete);

        const updatedPaystubs = paystubs.filter(paystub => {
            return paystub.id !== paystubToDelete.id;
        });
        setPaystubs(updatedPaystubs);
    };
    
    return { paystubs, addNewPaystub, updatePaystubs, deleteFromPaystubs };
};

export default usePaystubs;