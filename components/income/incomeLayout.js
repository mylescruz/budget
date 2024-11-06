import IncomeTable from "./incomeTable";

const IncomeLayout = () => {
    const paystubs = [
        {
            id: 0,
            date: "11/08/24",
            company: "Google",
            gross: 1000,
            taxes: 250,
            net: 750
        },
        {
            id: 1,
            date: "11/22/24",
            company: "Google",
            gross: 1000,
            taxes: 250,
            net: 750
        }
    ];

    return (
        <>
            <IncomeTable paystubs={paystubs}/>
        </>
    );
};

export default IncomeLayout;