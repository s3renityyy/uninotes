import { ContentItem } from "../components/ContentEditor/ContentEditor";

export const fetchContent = async (
  section?: string,
  type?: string
): Promise<ContentItem[]> => {
  try {
    const path = [section, type].filter(Boolean).join("/");
    const response = await fetch(`/api/${path}`);
    if (!response.ok) throw new Error("Ошибка запроса");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("❌ Ошибка при получении данных:", err);
    return [];
  }
};
