import React, { useEffect, useState } from "react";
import styles from "./ContentDisplay.module.scss";
import Modal from "../Modal/Modal";
import { useParams } from "react-router-dom";

export interface ContentItem {
  id: string;
  type: "image" | "file" | "text";
  src?: string;
  name?: string;
}

const ContentDisplay: React.FC = () => {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const { section, type } = useParams();
  const [updates, setUpdates] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/${section}/${type}`);
        const data = await res.json();

        const content: ContentItem[] = data.content.map((block: any) => ({
          id: block._id,
          type: block.type,
          src: block.data || block.url || "",
          name: block.caption || "",
        }));

        setUpdates(content.reverse());
      } catch {
        setError("Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [section, type]);

  if (loading)
    return (
      <div className={styles["content-display__loading"]}>Загрузка...</div>
    );
  if (error)
    return <div className={styles["content-display__error"]}>{error}</div>;

  return (
    <>
      <header className={styles.header}>{section}</header>
      <div className={styles["content-display"]}>
        {updates.map((item) => (
          <div key={item.id} className={styles["content-display__card"]}>
            {item.type === "text" && item.src && (
              <div className={styles["content-display__text"]}>{item.src}</div>
            )}

            {item.type === "image" && item.src && (
              <div className={styles["content-display__media"]}>
                <img
                  src={item.src}
                  className={styles["content-display__image"]}
                  onClick={() => setModalImage(item.src!)}
                  alt={item.name}
                />
              </div>
            )}

            {item.type === "file" && item.src && (
              <div className={styles["content-display__media"]}>
                <a
                  className={styles["content-display__file"]}
                  href={item.src}
                  download={item.name}
                >
                  {item.name}
                </a>
              </div>
            )}
          </div>
        ))}

        {modalImage && (
          <Modal isOpen closeModal={() => setModalImage(null)}>
            <img
              src={modalImage}
              className={styles["content-display__modal-image"]}
              alt="Modal view"
            />
          </Modal>
        )}
      </div>
    </>
  );
};

export default ContentDisplay;
