import { useAdmin } from "../../hooks/useAdmin";
import Button from "../../components/Button/Button";
import styles from "./admin-panel.module.scss";
import { useEffect, useState } from "react";

interface PageRoute {
  section: string;
  type: string;
  title: string;
}

const AdminPanel = () => {
  const { isAdmin, login, logout } = useAdmin();
  const [password, setPassword] = useState("");
  const [section, setSection] = useState("");
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [routes, setRoutes] = useState<PageRoute[]>([]);

  const loadRoutes = async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    const loadedRoutes: PageRoute[] = [];
    data.forEach((section: any) => {
      section.children.forEach((child: any) => {
        loadedRoutes.push({
          section: section.key,
          type: child.key,
          title: child.label,
        });
      });
    });
    setRoutes(loadedRoutes);
  };

  useEffect(() => {
    if (isAdmin) loadRoutes();
  }, [isAdmin]);

  const addPage = async () => {
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

  const editRoute = async (oldSection: string, oldType: string) => {
    const newSection = prompt("Новый section:", oldSection);
    const newType = prompt("Новый type:", oldType);
    const newTitle = prompt("Новый заголовок:", "");
    if (!newSection || !newType || !newTitle) return;

    await fetch(`/api/${oldSection}/${oldType}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newSection,
        newType,
        newTitle,
      }),
    });
    loadRoutes();
  };

  return (
    <div className={styles.admin}>
      {isAdmin && (
        <>
          <div className={styles["route-form"]}>
            <input
              placeholder="Section"
              onChange={(e) => setSection(e.target.value)}
            />
            <input
              placeholder="Type"
              onChange={(e) => setType(e.target.value)}
            />
            <input
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
            />
            <button onClick={addPage}>Добавить страницу</button>
          </div>

          <div className={styles["routes-list"]}>
            {routes.map((route) => (
              <div
                key={`${route.section}-${route.type}`}
                className={styles.routeItem}
              >
                <span>
                  {route.section}/{route.type} ({route.title})
                </span>
                <button onClick={() => editRoute(route.section, route.type)}>
                  Изменить
                </button>
                <button onClick={() => deleteRoute(route.section, route.type)}>
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <div className={styles["admin-form"]}>
        {isAdmin ? (
          <div className={styles["admin-form-enabled"]}>
            Вы администратор!
            <Button
              onClick={logout}
              className={styles["admin-form-disabled-button"]}
            >
              Выйти
            </Button>
          </div>
        ) : (
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
              onClick={() => {
                const success = login(password);
                if (!success) alert("Неверный пароль");
              }}
              className={styles["admin-form-disabled-button"]}
            >
              Войти
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
