import { ContentItem } from "../components/ContentEditor/ContentEditor";

const sendToBackend = async (item: ContentItem) => {
  try {
    const formData = new FormData();
    formData.append("id", item.id);
    formData.append("timestamp", item.timestamp.toString());
    if (item.text) formData.append("text", item.text);
    if (item.file) formData.append("file", item.file);
    if (typeof item.image === "string") {
      formData.append("image", item.image);
    }

    const response = await fetch(`http://localhost:9000/tryhackme`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  } catch (error) {
    console.error("❌ Ошибка при отправке на сервер:", error);
  }
};

export default sendToBackend;
