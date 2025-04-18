import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "../../routes/routes";
import styles from "./MenuComponent.module.scss";
import Button from "../Button/Button";
import getSections from "../../requests/sections.requests";
import api from "../../utils/api";

interface MenuItem {
  key: string;
  label: string;
  onClick?: () => void;
  children?: MenuItem[];
  isAuth?: boolean;
}

const MenuComponent: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [openKeys, setOpenKeys] = useState<string[]>(["study"]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAuth, setIsAuth] = useState<boolean>(
    localStorage.getItem("user") === "true"
  );

  const navigate = useNavigate();
  const location = useLocation();

  const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
      await api.post("/logout");
      localStorage.setItem("user", "false");
      navigate("/login");
    };

    if (!isAuth) return null;

    return (
      <Button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Выйти
      </Button>
    );
  };

  useEffect(() => {
    const loadSections = async () => {
      const sections = await getSections();

      const transformed: MenuItem[] = [
        {
          key: "/",
          label: "Главная",
          onClick: () => navigate("/"),
        },
        {
          key: "study",
          label: "Обучение",
          children: sections.map((section: any) => ({
            key: section.key,
            label: section.label,
            children: section.children.map((child: any) => ({
              key: `/${section.key}/${child.key}`,
              label: child.label,
              onClick: () => navigate(`/${section.key}/${child.key}`),
            })),
          })),
        },
        {
          key: "admin",
          label: "Панель админа",
          onClick: () => navigate("/admin"),
        },
        {
          key: "login",
          label: "Войти",
          onClick: () => navigate("/login"),
          isAuth,
        },
        {
          key: "register",
          label: "Зарегистрироваться",
          onClick: () => navigate("/register"),
          isAuth,
        },
      ];
      setIsAuth(localStorage.getItem("user") === "true");
      setMenuItems(transformed);
    };

    loadSections();
  }, [navigate]);

  const handleOpenChange = (key: string) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const renderMenuItems = (items: MenuItem[]) => (
    <ul className={styles.menuList}>
      {items.map((item) => {
        if (isAuth && (item.key === "register" || item.key === "login")) {
          return null;
        }

        if (!isAuth && item.key === "admin-panel") {
          return null;
        }

        return (
          <li key={item.key} className={styles.menuItem}>
            <div
              className={`${styles.menuLabel} ${
                location.pathname === item.key ? styles.active : ""
              }`}
              onClick={item.onClick || (() => handleOpenChange(item.key))}
            >
              {item.label}
              {item.children && (
                <span className={styles.arrow}>
                  {openKeys.includes(item.key) ? "▼" : "▶"}
                </span>
              )}
            </div>
            {item.children && openKeys.includes(item.key) && (
              <div className={styles.submenu}>
                {renderMenuItems(item.children)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={styles.layoutContainer}>
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
      >
        <nav className={styles.menu}>{renderMenuItems(menuItems)}</nav>
        <Button
          className={styles.collapseButton}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "⭢" : "⭠"}
        </Button>
        <LogoutButton />
      </aside>
      <main className={styles.mainContent}>
        <div className={styles.content}>
          <AppRoutes />
        </div>
      </main>
    </div>
  );
};

export default MenuComponent;
