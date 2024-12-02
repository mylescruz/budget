import usePaystubs from "@/hooks/usePaystubs";
import IncomeTable from "./incomeTable";
import dateInfo from "@/helpers/dateInfo";

const IncomeLayout = () => {
    const { paystubs, addPaystub, updatePaystubs, deleteFromPaystubs } = usePaystubs(dateInfo.currentYear);

    return (
        <>
            <IncomeTable paystubs={paystubs}/>
        </>
    );
};

export default IncomeLayout;