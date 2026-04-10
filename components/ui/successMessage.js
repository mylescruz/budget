import { useEffect, useState } from "react";
import styles from "@/styles/ui/successMessage.module.css";

// Display a message when an API call is made successfully
const SuccessMessage = ({ show, message }) => {
  const [showMessage, setShowMessage] = useState(false);

  // Display the success message for 2 seconds and then have it dissapear
  useEffect(() => {
    if (show) {
      setShowMessage(true);

      const timer = setTimeout(() => setShowMessage(false), 2000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <div
      className={`bg-success rounded text-white d-flex justify-content-center align-items-center text-center ${styles.messageContainer} ${showMessage ? styles.showMessage : ""}`}
    >
      <p className="p-0 m-0">{message}</p>
    </div>
  );
};

export default SuccessMessage;
