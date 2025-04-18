import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import styles from "./AdminLoginPage.module.scss";
import { useState } from "react";

interface PageRoute {
  section: string;
  type: string;
  title: string;
}

interface EditingRoute {
  section: string;
  type: string;
  title: string;
}

const AdminLoginPage = () => {
  const [password, setPassword] = useState("");
  const [section, setSection] = useState("");
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [routes, setRoutes] = useState<PageRoute[]>([]);
  const navigate = useNavigate();
  const [editingRoutes, setEditingRoutes] = useState<
    Record<string, EditingRoute>
  >({});

  const handleLogout = async () => {
    const res = await fetch("/api/admin/logout", {
      method: "POST",
    });
    navigate("/admin/login");
    return res;
  };

  const handleSignIn = async (password: string) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    localStorage.setItem("isAdmin", "true");
    navigate("/admin");
    return res;
  };

  const loadRoutes = async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    const loadedRoutes: PageRoute[] = [];

    data.forEach((sec: any) => {
      sec.children.forEach((child: any) => {
        loadedRoutes.push({
          section: sec.key,
          type: child.key,
          title: child.label,
        });
      });
    });

    setRoutes(loadedRoutes);
  };

  const addPage = async () => {
    if (routes.some((r) => r.section === section && r.type === type)) {
      alert("Такой маршрут уже существует");
      return;
    }

    await fetch(`/api/${section}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: [] }),
    });
    loadRoutes();
  };

  const deleteRoute = async (section: string, type: string) => {
    await fetch(`/api/${section}/${type}`, { method: "DELETE" });
    loadRoutes();
  };

  const editRoute = async (
    oldSection: string,
    oldType: string,
    newSection: string,
    newType: string,
    newTitle: string
  ) => {
    if (!newSection || !newType || !newTitle) return;

    const res = await fetch(`/api/${oldSection}/${oldType}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newSection,
        newType,
        newTitle,
      }),
    });

    if (!res.ok) {
      console.error("Ошибка при обновлении роута:", await res.text());
      return;
    }

    await loadRoutes();
  };

  return (
    <>
      <header className={styles.header}>Панель администрирования</header>
      <div className={styles["admin-form-disabled"]}>
        <div className={styles["admin-form-disabled-label"]}>
          Введите пароль
        </div>
        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles["admin-form-disabled-input"]}
        />
        <Button
          onClick={() => handleSignIn(password)}
          className={styles["admin-form-disabled-button"]}
        >
          Войти
        </Button>
      </div>
    </>
  );
};

export default AdminLoginPage;
