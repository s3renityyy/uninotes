import React, { useEffect, useState } from "react";
import styles from "./ContentDisplay.module.scss";
import Modal from "../Modal/Modal";
import TextareaAutosize from "react-textarea-autosize";
import { useParams } from "react-router-dom";

export interface ContentItem {
  id: string;
  type: "image" | "file" | "text";
  src?: string;
  name?: string;
  file?: File;
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
      } catch (err: any) {
        setError("Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [section, type]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;
  return (
    <>
      <div className={styles.contentDisplay}>
        {updates.map((item) => (
          <div key={item.id} className={styles.contentCard}>
            {item.type === "text" && item.src && (
              <div style={{ whiteSpace: "pre-wrap" }}>{item.src}</div>
            )}
            {item.type === "image" && item.src && (
              <div className={styles["contentCard-image"]}>
                <img
                  src={item.src}
                  className={styles.contentImage}
                  onClick={() => setModalImage(item.src!)}
                  alt={item.name}
                />
              </div>
            )}
            {item.type === "file" && item.src && (
              <div className={styles["contentCard-image"]}>
                <a className={styles.file} href={item.src} download={item.name}>
                  {item.name}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalImage && (
        <Modal isOpen={true} closeModal={() => setModalImage(null)}>
          <img src={modalImage} className={styles.fullImage} alt="Modal view" />
        </Modal>
      )}
    </>
  );
};

export default ContentDisplay;
