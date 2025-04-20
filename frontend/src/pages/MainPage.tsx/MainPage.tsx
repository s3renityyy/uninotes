import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./MainPage.module.scss";

type Update = {
  section: string;
  type: string;
  title: string;
  updatedAt: string;
};

const MainPage: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(updates);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch("/api/updates");
        if (!response.ok) {
          throw new Error("Не удалось загрузить обновления");
        }
        const data = await response.json();
        setUpdates(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <>
      <header className={styles.header}>Последние обновления</header>
      <div className={styles.main__page}>
        <ul className={styles["main__page-list"]}>
          {updates.map((item) => (
            <li key={`${item.section}-${item.type}`}>
              <Link to={`/${item.section}/${item.type}`}>
                <strong>{`${item.title} ${item.type}`}</strong> (Обновлено:{" "}
                {new Date(item.updatedAt).toLocaleString()})
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default MainPage;
