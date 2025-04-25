import React, { useEffect, useState } from "react";
import styles from "./ContentDisplay.module.scss";
import Modal from "../Modal/Modal";
import { useParams } from "react-router-dom";
import { ContentItem } from "../ContentEditor/ContentEditor";
import eStyles from "./ContentDisplay.module.scss";

type ContentBlock = {
  _id: string;
  type: string;
  data?: string;
  url?: string;
  caption?: string;
  dateAdded?: string;
};

type PageData = {
  section: string;
  type: string;
  sectionTitle: string;
  typeTitle: string;
  content: ContentBlock[];
  updatedAt: string;
};

const ContentDisplay: React.FC = () => {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const { section, type } = useParams();
  const [updates, setUpdates] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<PageData | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/${section}/${type}`);
        const data = await res.json();

        const content: ContentItem[] = data.content.map((b: any) => ({
          id: b._id,
          text: b.text || "",
          files: b.files || [],
          dateAdded: b.dateAdded,
        }));

        setPage(data);
        setUpdates(content);
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
      <header className={styles.header}>
        {page && page.sectionTitle} ({page && page.typeTitle})
      </header>
      <div className={eStyles["content-editor__list"]}>
        {updates.map((block) => {
          const text = block.text;
          const files = block.files || [];
          const images = files.filter((f: any) => f.type === "image");
          const other = files.filter((f: any) => f.type !== "image");

          return (
            <div key={block.id} className={styles["content-editor__list-item"]}>
              <div className={styles["content-editor__item-body"]}>
                {text && (
                  <div className={styles["content-editor__text"]}>
                    {block.text}
                  </div>
                )}

                {images.length > 0 && (
                  <div className={styles["content-editor__images-row"]}>
                    {images.map((img, i) => (
                      <div key={i} className={styles["content-editor__media"]}>
                        <img
                          src={img.url}
                          alt={img.caption}
                          className={eStyles["content-editor__media-image"]}
                          onClick={() => setModalImage(img.url)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {other.length > 0 && (
                  <div className={styles["content-editor__files-col"]}>
                    {other.map((f, i) => (
                      <div key={i} className={styles["content-editor__media"]}>
                        <a
                          href={f.url}
                          download={f.caption}
                          className={styles["content-editor__media-file"]}
                        >
                          {f.caption}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalImage && (
        <Modal isOpen closeModal={() => setModalImage(null)}>
          <img
            src={modalImage}
            className={styles["content-editor__modal-image"]}
          />
        </Modal>
      )}
    </>
  );
};

export default ContentDisplay;
