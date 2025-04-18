import { useAdmin } from "../../hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import styles from "./AdminPage.module.scss";
import { useEffect, useState } from "react";

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

const AdminPage = () => {
  const { isAdmin } = useAdmin();
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
    localStorage.setItem("isAdmin", "false");
    navigate("/admin/login");
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

  useEffect(() => {
    if (isAdmin) loadRoutes();
  }, [isAdmin]);

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
      <div className={styles.admin}>
        {isAdmin && (
          <>
            <div className={styles["admin-routes"]}>
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
                <Button onClick={addPage}>Создать роут</Button>
              </div>
              <div className={styles["admin-routes-list"]}>
                <div className={styles["admin-routes-list-item"]}>
                  {routes.map((route) => {
                    const key = `${route.section}-${route.type}`;
                    const editing = editingRoutes[key] || route;

                    const handleChange = (
                      field: keyof EditingRoute,
                      value: string
                    ) => {
                      setEditingRoutes((prev) => ({
                        ...prev,
                        [key]: {
                          ...editing,
                          [field]: value,
                        },
                      }));
                    };

                    return (
                      <div key={key} className={styles.routeItem}>
                        <input
                          value={editing.section}
                          onChange={(e) =>
                            handleChange("section", e.target.value)
                          }
                        />
                        <input
                          value={editing.type}
                          onChange={(e) => handleChange("type", e.target.value)}
                        />
                        <input
                          value={editing.title}
                          onChange={(e) =>
                            handleChange("title", e.target.value)
                          }
                        />
                        <Button
                          onClick={() =>
                            editRoute(
                              route.section,
                              route.type,
                              editing.section,
                              editing.type,
                              editing.title
                            )
                          }
                        >
                          Изменить
                        </Button>
                        <Button
                          onClick={() => deleteRoute(route.section, route.type)}
                        >
                          Удалить
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        <div className={styles["admin-form"]}>
          <div className={styles["admin-form-enabled"]}>
            Вы администратор!
            <Button
              onClick={() => handleLogout()}
              className={styles["admin-form-disabled-button"]}
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
