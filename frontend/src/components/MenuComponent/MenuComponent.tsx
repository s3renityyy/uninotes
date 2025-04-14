import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "../../routes/routes";
import { useAdmin } from "../../hooks/useAdmin";
import styles from "./MenuComponent.module.scss";
import Button from "../Button/Button";

interface MenuItem {
  key: string;
  label: string;
  onClick?: () => void;
  children?: MenuItem[];
}

const MenuComponent: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [openKeys, setOpenKeys] = useState<string[]>(["study"]);
  const { isAdmin, login, logout } = useAdmin();
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenChange = (key: string) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const menuItems: MenuItem[] = [
    {
      key: "/",
      label: "Главная",
      onClick: () => navigate("/"),
    },
    {
      key: "study",
      label: "Обучение",
      children: [
        {
          key: "/tryhackme",
          label: "TryHackMe",
          onClick: () => navigate("/tryhackme"),
        },
        {
          key: "algorithms",
          label: "Алгоритмы",
          children: [
            {
              key: "/algorithms/lab",
              label: "Лабораторные работы",
              onClick: () => navigate("/algorithms/lab"),
            },
            {
              key: "/algorithms/notes",
              label: "Конспекты",
              onClick: () => navigate("/algorithms/notes"),
            },
          ],
        },
        {
          key: "edpm",
          label: "Архитектура ЭВМ",
          children: [
            {
              key: "/edpm/lab",
              label: "Лабораторные работы",
              onClick: () => navigate("/edpm/lab"),
            },
            {
              key: "/edpm/notes",
              label: "Конспекты",
              onClick: () => navigate("/edpm/notes"),
            },
          ],
        },
      ],
    },
  ];

  const renderMenuItems = (items: MenuItem[]) => {
    return (
      <ul className={styles.menuList}>
        {items.map((item) => (
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
        ))}
      </ul>
    );
  };

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
          {collapsed ? "»" : "«"}
        </Button>
        {!collapsed &&
          (isAdmin ? (
            <div className={styles.adminenabled}>
              Вы администратор!
              <Button
                onClick={logout}
                className={styles["admindisabled-button"]}
              >
                Выйти
              </Button>
            </div>
          ) : (
            <div className={styles.admindisabled}>
              <div className={styles["admindisabled-label"]}>
                Введите пароль
              </div>
              <input
                placeholder="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles["admindisabled-input"]}
              />
              <Button
                onClick={() => {
                  const success = login(password);
                  if (!success) alert("Неверный пароль");
                }}
                className={styles["admindisabled-button"]}
              >
                Войти
              </Button>
            </div>
          ))}
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
