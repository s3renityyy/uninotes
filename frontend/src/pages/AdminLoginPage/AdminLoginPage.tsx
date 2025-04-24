import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import Button from "../../components/Button/Button";
import styles from "./AdminLoginPage.module.scss";
import { useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import ReCAPTCHA from "react-google-recaptcha";

const AdminLoginPage = () => {
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const checkAdmin = useAdminStore((s) => s.checkAdmin);
  const [errorCount, setErrorCount] = useState(0);
  const showCaptcha = errorCount >= 3;
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSignIn = async () => {
    if (showCaptcha && !captchaToken) {
      return;
    }

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, captchaToken }),
      credentials: "include",
    });

    if (res.ok) {
      await checkAdmin();
      navigate("/admin");
    } else {
      setPassword("");
      setCaptchaToken(null);
      setErrorCount((prev) => prev + 1);

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }

      alert("Ошибка входа");
    }
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
          onClick={handleSignIn}
          className={styles["admin-form-disabled-button"]}
        >
          Войти
        </Button>
        {showCaptcha && (
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY_LOCAL}
            onChange={(token: any) => setCaptchaToken(token)}
            className={styles["admin-form-disabled-captcha"]}
          />
        )}
      </div>
    </>
  );
};

export default AdminLoginPage;
