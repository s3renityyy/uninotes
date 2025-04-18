import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/me")
      .then(() => setLoading(false))
      .catch(() => navigate("/login"));
  }, [navigate]);

  if (loading) return <div className="p-4">Загрузка...</div>;

  return <>{children}</>;
};

export default RequireAuth;
