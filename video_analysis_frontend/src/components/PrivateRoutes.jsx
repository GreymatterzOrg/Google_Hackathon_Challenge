import { Navigate, useLocation } from "react-router-dom";

const PrivateRoutes = ({ element, roles }) => {
  const user = localStorage.getItem("user");

  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default PrivateRoutes;
