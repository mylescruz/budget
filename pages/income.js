import PaystubLayout from "@/components/paystubs/paystubLayout";
import dateInfo from "@/helpers/dateInfo";

export default function Income() {
    const year = dateInfo.currentYear;

    return (
        <PaystubLayout year={year} />
    );
};