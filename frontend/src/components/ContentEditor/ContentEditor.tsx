import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import TextareaAutosize from "react-textarea-autosize";
import styles from "./ContentEditor.module.scss";

import TrashIcon from "../../assets/icons/trash.svg?react";
import AttachIcon from "../../assets/icons/attach.svg?react";
import SendIcon from "../../assets/icons/send.svg?react";
import EditIcon from "../../assets/icons/edit.svg?react";
import ApplyIcon from "../../assets/icons/apply.svg?react";
import CancelIcon from "../../assets/icons/cancel.svg?react";
import Modal from "../Modal/Modal";

export interface FileItem {
  type: "image" | "file";
  url: string;
  caption: string;
}

export interface ContentItem {
  id: string;
  dateAdded: string;
  text?: string;
  files?: FileItem[];
}

type Props = { updates: ContentItem[]; onContentAdded: () => void };

const ContentEditor: React.FC<Props> = ({ updates, onContentAdded }) => {
  const { section, type } = useParams<{ section: string; type: string }>();

  const [newText, setNewText] = useState("");
  const [filesUI, setFilesUI] = useState<File[]>([]);
  const filesRef = useRef<File[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingFiles, setEditingFiles] = useState<FileItem[]>([]);

  const [csrf, setCsrf] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/csrf-token", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCsrf(d.csrfToken));
  }, []);

  const resetNew = () => {
    setNewText("");
    setFilesUI([]);
    filesRef.current = [];
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const arr = Array.from(e.target.files);
    setFilesUI((p) => [...p, ...arr]);
    filesRef.current = [...filesRef.current, ...arr];
    e.target.value = "";
  };

  const removeNewFile = (idx: number) => {
    setFilesUI((p) => p.filter((_, i) => i !== idx));
    filesRef.current = filesRef.current.filter((_, i) => i !== idx);
  };

  const postNew = async () => {
    if ((!newText.trim() && filesRef.current.length === 0) || !section || !type)
      return;
    const fd = new FormData();
    if (newText.trim()) fd.append("text", newText.trim());
    filesRef.current.forEach((f) => fd.append("files", f));
    await fetch(`/api/${section}/${type}`, {
      method: "POST",
      credentials: "include",
      headers: { "CSRF-Token": csrf },
      body: fd,
    });
    resetNew();
    onContentAdded();
  };

  const startEditing = (item: ContentItem) => {
    setEditingId(item.id);
    setEditingText(item.text || "");
    setEditingFiles(JSON.parse(JSON.stringify(item.files || [])));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingFiles([]);
  };

  const applyEdit = async () => {
    if (!editingId || !section || !type) return;
    await fetch(`/api/${section}/${type}/${editingId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", "CSRF-Token": csrf },
      body: JSON.stringify({ text: editingText, files: editingFiles }),
    });
    cancelEdit();
    onContentAdded();
  };

  const deleteFileFromEditing = (idx: number) =>
    setEditingFiles((p) => p.filter((_, i) => i !== idx));

  const deleteBlock = async (id: string) => {
    if (!section || !type) return;
    await fetch(`/api/${section}/${type}/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "CSRF-Token": csrf },
    });
    onContentAdded();
  };

  return (
    <div className={styles["content-editor"]}>
      <div className={styles["content-editor__form"]}>
        <TextareaAutosize
          className={styles["content-editor__textarea"]}
          placeholder="Введите текст..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              postNew();
            }
          }}
        />
        <button
          className={styles["content-editor__form-btn"]}
          onClick={() => fileInputRef.current?.click()}
        >
          <AttachIcon className={styles["content-editor__icon"]} />
        </button>
        <button
          className={styles["content-editor__form-btn"]}
          onClick={postNew}
        >
          <SendIcon className={styles["content-editor__icon"]} />
        </button>
        <input
          hidden
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.zip,.rar,.7z,.tar,.gz"
          onChange={handleFileChange}
        />
      </div>

      {filesUI.length > 0 && (
        <div className={styles["content-editor__attachments"]}>
          {filesUI.map((f, i) => (
            <div key={i} className={styles["content-editor__attachment"]}>
              <span>{f.name}</span>
              <button onClick={() => removeNewFile(i)}>
                <TrashIcon className={styles["content-editor__icon"]} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles["content-editor__list"]}>
        {updates.map((block) => {
          const isEdit = editingId === block.id;
          const text = isEdit ? editingText : block.text;
          const files = isEdit ? editingFiles : block.files || [];
          const images = files.filter((f) => f.type === "image");
          const other = files.filter((f) => f.type !== "image");

          return (
            <div key={block.id} className={styles["content-editor__list-item"]}>
              <div className={styles["content-editor__item-body"]}>
                {isEdit ? (
                  <TextareaAutosize
                    className={`${styles["content-editor__textarea"]} ${styles["content-editor__textarea--edit"]}`}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                ) : (
                  text && (
                    <div
                      className={styles["content-editor__text"]}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(text || ""),
                      }}
                    />
                  )
                )}

                {images.length > 0 && (
                  <div className={styles["content-editor__images-row"]}>
                    {images.map((img, i) => (
                      <div key={i} className={styles["content-editor__media"]}>
                        <img
                          src={img.url}
                          alt={img.caption}
                          className={styles["content-editor__media-image"]}
                          onClick={() => setModalImage(img.url)}
                        />
                        {isEdit && (
                          <button
                            className={styles["content-editor__btn"]}
                            onClick={() => deleteFileFromEditing(i)}
                          >
                            <TrashIcon
                              className={styles["content-editor__icon"]}
                            />
                          </button>
                        )}
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
                        {isEdit && (
                          <button
                            className={styles["content-editor__btn"]}
                            onClick={() =>
                              deleteFileFromEditing(images.length + i)
                            }
                          >
                            <TrashIcon
                              className={styles["content-editor__icon"]}
                            />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles["content-editor__item-controls"]}>
                {isEdit ? (
                  <>
                    <button
                      className={styles["content-editor__btn"]}
                      onClick={applyEdit}
                    >
                      <ApplyIcon className={styles["content-editor__icon"]} />
                    </button>
                    <button
                      className={styles["content-editor__btn"]}
                      onClick={cancelEdit}
                    >
                      <CancelIcon className={styles["content-editor__icon"]} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={styles["content-editor__btn"]}
                      onClick={() => deleteBlock(block.id)}
                    >
                      <TrashIcon className={styles["content-editor__icon"]} />
                    </button>
                    <button
                      className={styles["content-editor__btn"]}
                      onClick={() => startEditing(block)}
                    >
                      <EditIcon className={styles["content-editor__icon"]} />
                    </button>
                  </>
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
    </div>
  );
};

export default ContentEditor;
