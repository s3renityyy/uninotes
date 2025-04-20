import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";
import { ReactNode } from "react";

interface RequireAuthAdminProps {
  children: ReactNode;
  path?: string;
}

const RequireAuthAdmin = ({ children, path }: RequireAuthAdminProps) => {
  const { isAdmin, checkAdmin } = useAdminStore();
  const navigate = useNavigate();
  const { section, type } = useParams();

  useEffect(() => {
    if (isAdmin === null) {
      checkAdmin();
    }
  }, [isAdmin, checkAdmin]);

  useEffect(() => {
    if (isAdmin === false) {
      const redirectTo =
        path || (section && type ? `/${section}/${type}/show` : "/admin/login");
      navigate(redirectTo);
    }
  }, [isAdmin, path, navigate, section, type]);

  if (isAdmin === null) {
    return <div className="p-4">Загрузка...</div>;
  }

  if (isAdmin === false) return null;

  return <>{children}</>;
};

export default RequireAuthAdmin;
