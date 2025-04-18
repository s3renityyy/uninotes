import { useEffect, useState, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

interface RequireAuthAdminProps {
  children: ReactNode;
  path?: string;
}

const RequireAuthAdmin = ({ children, path }: RequireAuthAdminProps) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { section, type } = useParams();

  useEffect(() => {
    api
      .get("/admin/me")
      .then(() => setLoading(false))
      .catch(() => {
        const redirectTo =
          path ||
          (section && type ? `/${section}/${type}/show` : "/admin/login");
        navigate(redirectTo);
      });
  }, [navigate, path, section, type]);

  if (loading) return <div className="p-4">Загрузка...</div>;

  return <>{children}</>;
};

export default RequireAuthAdmin;
