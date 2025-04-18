import React, { useState, useRef, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import styles from "./ContentEditor.module.scss";
import Modal from "../Modal/Modal";

export interface ContentItem {
  id: string;
  type: "image" | "file" | "text";
  src?: string;
  name?: string;
  file?: File;
}

type ContentEditorType = {
  isEditable: boolean;
  updates: ContentItem[];
  onContentAdded: () => void;
};

const TextItemEditor: React.FC<{
  item: ContentItem;
  onSave: (id: string, data: string) => void;
  onDelete: (id: string) => void;
}> = ({ item, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.src || "");

  const handleSave = () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    onSave(item.id, editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(item.src || "");
    setIsEditing(false);
  };

  return (
    <div className={styles["contentCard-text"]}>
      {isEditing ? (
        <>
          <textarea
            className={styles.editorInline}
            value={editText}
            placeholder="Введите текст"
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className={styles["contentCard-text-images"]}>
            <div
              onClick={handleSave}
              className={styles["contentCard-text-images-trash"]}
            >
              <img
                src="/apply.svg"
                alt="Save"
                className={styles["contentCard-text-images-edit-svg"]}
              />
            </div>
            <div
              onClick={handleSave}
              className={styles["contentCard-text-images-trash"]}
            >
              <img
                src="/cancel.svg"
                alt="Cancel"
                onClick={handleCancel}
                className={styles["contentCard-text-images-edit-svg"]}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ whiteSpace: "pre-wrap" }}>{item.src}</div>
          <div className={styles["contentCard-text-images"]}>
            <div
              onClick={() => setIsEditing(true)}
              className={styles["contentCard-text-images-trash"]}
            >
              <img
                src="/edit.svg"
                alt="Edit"
                className={styles["contentCard-text-images-edit-svg"]}
              />
            </div>
            <div
              className={styles["contentCard-text-images-trash"]}
              onClick={() => onDelete(item.id)}
            >
              <img
                src="/trash.svg"
                alt="Delete"
                className={styles["contentCard-text-images-trash-svg"]}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ContentEditor: React.FC<ContentEditorType> = ({
  isEditable,
  updates,
  onContentAdded,
}) => {
  const { section, type } = useParams<{ section: string; type: string }>();
  const [newText, setNewText] = useState("");
  const [modalImage, setModalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isErrorInput, setIsErrorInput] = useState<boolean>(false);

  const handleSubmit = async () => {
    const trimmed = newText.trim();
    if (!trimmed) {
      setIsErrorInput(true);
      return;
    } else {
      setIsErrorInput(false);
    }

    try {
      if (!section || !type) throw new Error("Section или type не определены.");

      const response = await fetch(`/api/${section}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", data: trimmed }),
      });
      if (!response.ok) throw new Error("Не удалось добавить контент");

      setNewText("");
      onContentAdded();
    } catch (err: any) {
      console.error("Ошибка при отправке контента:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const fileSrc = reader.result;
      if (!section || !type) return;

      await fetch(`/api/${section}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: file.type.startsWith("image/") ? "image" : "file",
          url: fileSrc,
          caption: file.name,
        }),
      });

      onContentAdded();
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const deleteContent = async (contentId: string) => {
    if (!section || !type) return;
    await fetch(`/api/${section}/${type}/${contentId}`, { method: "DELETE" });
    onContentAdded();
  };

  const editContent = async (contentId: string, newData: string) => {
    if (!section || !type) return;
    await fetch(`/api/${section}/${type}/${contentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: newData, caption: "" }),
    });
    onContentAdded();
  };

  const downloadFile = (url?: string, fileName?: string) => {
    if (!url || !fileName) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className={styles.contentEditor}>
        {isEditable && (
          <>
            <div className={styles["contentEditor-form"]}>
              <textarea
                className={`${styles.editorArea} ${
                  isErrorInput && styles.error
                }`}
                value={newText}
                onChange={(e) => {
                  setNewText(e.target.value);
                  if (e.target.value.trim()) setIsErrorInput(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Введите текст..."
              />
              <div
                className={styles["contentEditor-form-img"]}
                onClick={handleUploadClick}
              >
                <img
                  className={styles["contentEditor-form-loadImage"]}
                  src="/attach.svg"
                  alt="Attach"
                />
              </div>
              <div
                className={styles["contentEditor-form-img"]}
                onClick={handleSubmit}
              >
                <img
                  className={styles["contentEditor-form-send"]}
                  src="/send.svg"
                  alt="Send"
                />
              </div>
            </div>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </>
        )}

        <div className={styles.contentDisplay}>
          {updates.map((item) => (
            <div key={item.id} className={styles.contentCard}>
              {item.type === "text" && item.src && (
                <TextItemEditor
                  item={item}
                  onSave={editContent}
                  onDelete={deleteContent}
                />
              )}
              {item.type === "image" && item.src && (
                <div className={styles["contentCard-image"]}>
                  <img
                    src={item.src}
                    className={styles.contentImage}
                    onClick={() => setModalImage(item.src!)}
                    alt={item.name}
                  />
                  {localStorage.getItem("isAdmin") && (
                    <div className={styles["contentCard-text-images"]}>
                      <div
                        onClick={() => downloadFile(item.src, item.name)}
                        className={styles["contentCard-text-images-trash"]}
                      >
                        <img
                          src="/download.svg"
                          alt="Download"
                          className={
                            styles["contentCard-text-images-trash-svg"]
                          }
                        />
                      </div>
                      <div
                        onClick={() => deleteContent(item.id)}
                        className={styles["contentCard-text-images-trash"]}
                      >
                        <img
                          src="/trash.svg"
                          alt="Delete"
                          className={
                            styles["contentCard-text-images-trash-svg"]
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              {item.type === "file" && item.src && (
                <div className={styles["contentCard-image"]}>
                  <a
                    className={styles.file}
                    href={item.src}
                    download={item.name}
                  >
                    {item.name}
                  </a>
                  {localStorage.getItem("isAdmin") && (
                    <div
                      onClick={() => deleteContent(item.id)}
                      className={styles["contentCard-text-images-trash"]}
                    >
                      <img
                        src="/trash.svg"
                        alt="Delete"
                        className={styles["contentCard-text-images-trash-svg"]}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {modalImage && (
          <Modal isOpen={true} closeModal={() => setModalImage(null)}>
            <img
              src={modalImage}
              className={styles.fullImage}
              alt="Modal view"
            />
          </Modal>
        )}
      </div>
    </>
  );
};

export default ContentEditor;
