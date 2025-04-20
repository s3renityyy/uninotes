import React, { useState, useRef, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import styles from "./ContentEditor.module.scss";
import Modal from "../Modal/Modal";
import TextareaAutosize from "react-textarea-autosize";
import TrashIcon from "../../assets/icons/trash.svg?react";
import ApplyIcon from "../../assets/icons/apply.svg?react";
import CancelIcon from "../../assets/icons/cancel.svg?react";
import EditIcon from "../../assets/icons/edit.svg?react";
import AttachIcon from "../../assets/icons/attach.svg?react";
import SendIcon from "../../assets/icons/send.svg?react";

export interface ContentItem {
  id: string;
  type: "image" | "file" | "text";
  src?: string;
  name?: string;
  file?: File;
}

type ContentEditorType = {
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
    <div className={styles["content-editor__item"]}>
      {isEditing ? (
        <>
          <TextareaAutosize
            className={styles["content-editor__textarea"]}
            value={editText}
            placeholder="Введите текст"
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className={styles["content-editor__controls"]}>
            <button
              type="button"
              onClick={handleSave}
              className={styles["content-editor__btn"]}
            >
              <ApplyIcon className={styles["content-editor__icon"]} />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={styles["content-editor__btn"]}
            >
              <CancelIcon className={styles["content-editor__icon"]} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ whiteSpace: "pre-wrap" }}>{item.src}</div>
          <div className={styles["content-editor__controls"]}>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={styles["content-editor__btn"]}
            >
              <EditIcon className={styles["content-editor__icon"]} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className={styles["content-editor__btn"]}
            >
              <TrashIcon className={styles["content-editor__icon"]} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ContentEditor: React.FC<ContentEditorType> = ({
  updates,
  onContentAdded,
}) => {
  const { section, type } = useParams<{ section: string; type: string }>();
  const [newText, setNewText] = useState("");
  const [modalImage, setModalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isErrorInput, setIsErrorInput] = useState(false);

  const handleSubmit = async () => {
    const trimmed = newText.trim();
    if (!trimmed) {
      setIsErrorInput(true);
      return;
    }
    setIsErrorInput(false);

    if (!section || !type) return;
    await fetch(`/api/${section}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "text", data: trimmed }),
    });
    setNewText("");
    onContentAdded();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !section || !type) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await fetch(`/api/${section}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: file.type.startsWith("image/") ? "image" : "file",
          url: reader.result,
          caption: file.name,
        }),
      });
      onContentAdded();
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const deleteContent = async (id: string) => {
    if (!section || !type) return;
    await fetch(`/api/${section}/${type}/${id}`, { method: "DELETE" });
    onContentAdded();
  };

  const editContent = async (id: string, data: string) => {
    if (!section || !type) return;
    await fetch(`/api/${section}/${type}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, caption: "" }),
    });
    onContentAdded();
  };

  return (
    <div className={styles["content-editor"]}>
      <div className={styles["content-editor__form"]}>
        <TextareaAutosize
          className={`${styles["content-editor__textarea"]} ${
            isErrorInput ? styles["content-editor__textarea--error"] : ""
          }`}
          value={newText}
          placeholder="Введите текст..."
          onChange={(e) => {
            setNewText(e.target.value);
            if (e.target.value.trim()) setIsErrorInput(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button
          type="button"
          className={styles["content-editor__form-btn"]}
          onClick={() => fileInputRef.current?.click()}
        >
          <AttachIcon className={styles["content-editor__icon"]} />
        </button>
        <button
          type="button"
          className={styles["content-editor__form-btn"]}
          onClick={handleSubmit}
        >
          <SendIcon className={styles["content-editor__icon"]} />
        </button>
        <input
          hidden
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
        />
      </div>

      <div className={styles["content-editor__list"]}>
        {updates.map((item) => (
          <div key={item.id} className={styles["content-editor__list-item"]}>
            {item.type === "text" && item.src && (
              <TextItemEditor
                item={item}
                onSave={editContent}
                onDelete={deleteContent}
              />
            )}
            {item.type === "image" && item.src && (
              <div className={styles["content-editor__media"]}>
                <img
                  src={item.src}
                  alt={item.name}
                  className={styles["content-editor__media-image"]}
                  onClick={() => setModalImage(item.src!)}
                />
                <div className={styles["content-editor__controls"]}>
                  <button
                    type="button"
                    onClick={() => deleteContent(item.id)}
                    className={styles["content-editor__btn"]}
                  >
                    <TrashIcon className={styles["content-editor__icon"]} />
                  </button>
                </div>
              </div>
            )}
            {item.type === "file" && item.src && (
              <div className={styles["content-editor__media"]}>
                <a
                  href={item.src}
                  download={item.name}
                  className={styles["content-editor__media-file"]}
                >
                  {item.name}
                </a>
                <div className={styles["content-editor__controls"]}>
                  <button
                    type="button"
                    onClick={() => deleteContent(item.id)}
                    className={styles["content-editor__btn"]}
                  >
                    <TrashIcon className={styles["content-editor__icon"]} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalImage && (
        <Modal isOpen={true} closeModal={() => setModalImage(null)}>
          <img
            src={modalImage}
            alt="Modal"
            className={styles["content-editor__modal-image"]}
          />
        </Modal>
      )}
    </div>
  );
};

export default ContentEditor;
