import { useState, useEffect, useRef, ChangeEvent } from "react";

import { useAdmin } from "../../hooks/useAdmin";
import { sendToBackend } from "../../requests/content.requests";
import getListOfUpdates from "../../requests/main.requests";

import Button from "../Button/Button";
import Modal from "../Modal/Modal";

import styles from "./ContentEditor.module.scss";

export interface ContentItem {
  id: string;
  text?: string;
  file?: File;
  image?: string | File;
  timestamp: number;
}

type ContentEditorType = {
  isEditable?: boolean;
  updates?: ContentItem[];
};

const ContentEditor: React.FC<ContentEditorType> = ({
  isEditable = true,
  updates,
}) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isAdmin } = useAdmin();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItems();
        }
      },
      { rootMargin: "200px" }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [content]);

  useEffect(() => {
    if (updates) {
      setContent(updates);
    }
  }, [updates]);

  const loadMoreItems = async () => {
    const updates = await getListOfUpdates();
    if (updates) {
      setContent((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = updates.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
    }
  };

  const handleAddText = async () => {
    setError(null);

    if (!text.trim()) {
      setError("Поле не должно быть пустым");
      return;
    }

    if (text.length > 3000) {
      setError("Превышен лимит в 3000 символов");
      return;
    }

    const newItem: ContentItem = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
    };

    setIsSubmitting(true);
    await sendToBackend(newItem);
    setIsSubmitting(false);

    setContent((prev) => [newItem, ...prev]);
    setText("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;

          const newItem: ContentItem = {
            id: Date.now().toString(),
            image: imageData,
            timestamp: Date.now(),
          };

          sendToBackend(newItem);
          setContent((prev) => [newItem, ...prev]);
        };
        reader.readAsDataURL(file);
      } else {
        const newItem: ContentItem = {
          id: Date.now().toString(),
          file,
          timestamp: Date.now(),
        };

        sendToBackend(newItem);
        setContent((prev) => [newItem, ...prev]);
      }
    }
  };

  return (
    <div className={styles.contentEditor}>
      <div className={styles.contentControls}>
        {isImageModalOpen && selectedImage && (
          <Modal
            isOpen={isImageModalOpen}
            closeModal={() => setIsImageModalOpen(false)}
          >
            <img
              src={selectedImage}
              alt="Full view"
              className={styles.fullImage}
            />
          </Modal>
        )}

        {isAdmin && isEditable && (
          <div>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Введите текст..."
              className={`${styles.textArea} ${error ? styles.error : ""}`}
            />
            {error && <div className={styles.errorText}>{error}</div>}

            <div className={styles.buttonGroup}>
              <Button
                onClick={handleAddText}
                className={styles.addButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка..." : "Добавить текст"}
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                style={{ display: "none" }}
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                className={styles.uploadButton}
              >
                Загрузить файл/фото
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.contentDisplay}>
        {content.map((item) => (
          <div key={item.id} className={styles.contentCard}>
            {item.text && <p className={styles.contentText}>{item.text}</p>}

            {item.image && typeof item.image === "string" && (
              <div className={styles.fileContainer}>
                <img
                  src={item.image}
                  alt="Uploaded content"
                  className={styles.contentImage}
                  onClick={() => {
                    setSelectedImage(item.image as string);
                    setIsImageModalOpen(true);
                  }}
                />
                <img
                  src="/download.svg"
                  alt="Download"
                  className={styles.download}
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = item.image as string;
                    link.download = "image.jpg";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                />
              </div>
            )}

            {item.file && (
              <div className={styles.fileContainer}>
                <p>Файл: {item.file.name}</p>
                <img
                  src="/download.svg"
                  alt="Download"
                  className={styles.download}
                  onClick={() => {
                    const url = URL.createObjectURL(item.file!);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = item.file!.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                />
              </div>
            )}

            <div className={styles.timestamp}>
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentEditor;
