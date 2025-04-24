import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "../../routes/routes";
import styles from "./MenuComponent.module.scss";
import Button from "../Button/Button";
import { useRoutesStore } from "../../store/useRoutesStore";

interface MenuItem {
  key: string;
  label: string;
  onClick?: () => void;
  children?: MenuItem[];
}

interface MenuComponentProps {}

const MenuComponent: React.FC<MenuComponentProps> = () => {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [openKeys, setOpenKeys] = useState<string[]>(["study"]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const routes = useRoutesStore((s) => s.routes);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadSections = async () => {
      const transformed: MenuItem[] = [
        {
          key: "/",
          label: "Главная",
          onClick: () => {
            setCollapsed(true);
            navigate("/");
          },
        },
        {
          key: "study",
          label: "Обучение",
          children: routes.map((section: any) => ({
            key: section.key,
            label: section.label,
            children: section.children.map((child: any) => ({
              key: `/${section.key}/${child.key}`,
              label: child.label,
              onClick: () => {
                setCollapsed(true);
                navigate(`/${section.key}/${child.key}`);
              },
            })),
          })),
        },
        {
          key: "admin",
          label: "Панель админа",
          onClick: () => {
            setCollapsed(true);
            navigate("/admin");
          },
        },
      ];
      setMenuItems(transformed);
    };

    loadSections();
  }, [navigate, routes]);

  const handleOpenChange = (key: string) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const renderMenuItems = (items: MenuItem[]) => (
    <ul className={styles.menuList}>
      {items.map((item) => {
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
                <span
                  className={`${styles.arrow} ${
                    openKeys.includes(item.key) ? styles.open : styles.closed
                  }`}
                >
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
    <>
      {!collapsed && (
        <div className={styles.overlay} onClick={() => setCollapsed(true)} />
      )}

      <div className={styles.mobileButtonWrapper}>
        <Button
          className={styles.collapseButtonMobile}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "☰" : "✕"}
        </Button>
      </div>

      <div className={styles.layoutContainer}>
        <aside
          className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
        >
          <nav className={styles.menu}>{renderMenuItems(menuItems)}</nav>

          <Button
            className={styles.collapseButtonDesktop}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "⭢" : "⭠"}
          </Button>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.content}>
            <AppRoutes />
          </div>
        </main>
      </div>
    </>
  );
};

export default MenuComponent;
