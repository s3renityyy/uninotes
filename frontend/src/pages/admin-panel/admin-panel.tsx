import { useAdmin } from "../../hooks/useAdmin";
import Button from "../../components/Button/Button";
import styles from "./admin-panel.module.scss";
import { useState } from "react";

const AdminPanel = () => {
  const { isAdmin, login, logout } = useAdmin();
  const [password, setPassword] = useState("");

  return (
    <div className={styles.admin}>
      {isAdmin && <div>Панель администрирования</div>}
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
