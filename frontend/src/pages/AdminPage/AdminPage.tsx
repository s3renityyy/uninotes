import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import styles from "./AdminPage.module.scss";
import { useState, useEffect } from "react";
import { PageRoute } from "../../App";
import { useRoutesStore } from "../../store/useRoutesStore";
import { useAdminStore } from "../../store/useAdminStore";

interface EditingRoute {
  section: string;
  type: string;
  sectionTitle: string;
  typeTitle: string;
}

interface AdminPageProps {}

const AdminPage: React.FC<AdminPageProps> = () => {
  const [section, setSection] = useState("");
  const [type, setType] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [typeTitle, setTypeTitle] = useState("");
  const [newRoutes, setNewRoutes] = useState<PageRoute[]>();
  const { routes, fetchRoutes } = useRoutesStore();
  const navigate = useNavigate();
  const [editingRoutes, setEditingRoutes] = useState<
    Record<string, EditingRoute>
  >({});

  const isValidRouteKey = (key: string) => /^[a-zA-Z0-9_-]+$/.test(key);

  useEffect(() => {
    const loadedRoutes: PageRoute[] = [];

    routes.forEach((sec: any) => {
      sec.children.forEach((child: any) => {
        loadedRoutes.push({
          section: sec.key,
          type: child.key,
          sectionTitle: sec.label,
          typeTitle: child.label,
        });
      });
    });

    setNewRoutes(loadedRoutes);
  }, [routes]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    useAdminStore.setState({ isAdmin: null });
    navigate("/admin/login");
  };

  const addPage = async () => {
    if (!isValidRouteKey(section) || !isValidRouteKey(type)) {
      alert("Section и Type может содержать латиницу, цифры и символы -_");
      return;
    }
    if (newRoutes!.some((r) => r.section === section && r.type === type)) {
      alert("Такой маршрут уже существует");
      return;
    }
    await fetch(`/api/admin/${section}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionTitle, typeTitle, content: [] }),
    });

    await fetchRoutes().then(() => {
      setSection("");
      setType("");
      setSectionTitle("");
      setTypeTitle("");
    });
  };

  const deleteRoute = async (section: string, type: string) => {
    await fetch(`/api/admin/${section}/${type}`, { method: "DELETE" });
    await fetchRoutes();
  };

  const editRoute = async (
    oldSection: string,
    oldType: string,
    newSection: string,
    newType: string,
    newSectionTitle: string,
    newTypeTitle: string
  ) => {
    if (
      !isValidRouteKey(newSection) ||
      !isValidRouteKey(newType) ||
      !newSectionTitle.trim() ||
      !newTypeTitle.trim()
    ) {
      alert("Section и Type может содержать латиницу, цифры и символы -_");
      return;
    }
    const res = await fetch(`/api/admin/${oldSection}/${oldType}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: newSection,
        type: newType,
        sectionTitle: newSectionTitle,
        typeTitle: newTypeTitle,
      }),
    });

    if (!res.ok) {
      console.error("Ошибка при обновлении роута:", await res.text());
      return;
    }

    await fetchRoutes();
  };

  return (
    <>
      <header className={styles.header}>Панель администрирования</header>
      <div className={styles.admin}>
        <>
          <div className={styles["admin-routes"]}>
            <div className={styles["route-form"]}>
              <input
                placeholder="Заголовок"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
              <input
                placeholder="Тип"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
              <input
                placeholder="Название заголовка"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
              />
              <input
                placeholder="Название типа"
                value={typeTitle}
                onChange={(e) => setTypeTitle(e.target.value)}
              />
              <Button type="button" onClick={addPage}>
                Создать роут
              </Button>
            </div>
            <div className={styles["admin-routes-list"]}>
              <div className={styles["admin-routes-list-item"]}>
                {newRoutes &&
                  newRoutes.map((route) => {
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
                          value={editing.sectionTitle}
                          onChange={(e) =>
                            handleChange("sectionTitle", e.target.value)
                          }
                        />
                        <input
                          value={editing.typeTitle}
                          onChange={(e) =>
                            handleChange("typeTitle", e.target.value)
                          }
                        />
                        <Button
                          onClick={() =>
                            editRoute(
                              route.section,
                              route.type,
                              editing.section,
                              editing.type,
                              editing.sectionTitle,
                              editing.typeTitle
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
