import { useEffect, useState } from "react";

const useDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [dashboardRequest, setDashboardRequest] = useState({
    action: "get", // get
    status: "loading", // loading | success | error
    message: "Loading your Type-A Budget",
  });

  useEffect(() => {
    getDashboardInfo();
  }, []);

  const getDashboardInfo = async () => {
    setDashboardRequest({
      action: "get",
      status: "loading",
      message: "Loading your Type-A Budget",
    });

    try {
      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const fetchedInfo = await response.json();
      setDashboard(fetchedInfo);

      setDashboardRequest({
        action: "get",
        status: "success",
        message: "Successfully loaded your budget",
      });
    } catch (error) {
      setDashboardRequest({
        action: "get",
        status: "error",
        message: error.message,
      });
    }
  };

  return { dashboard, dashboardRequest };
};

export default useDashboard;
