import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import styles from "./AdminLoginPage.module.scss";
import { useState } from "react";

const AdminLoginPage = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
