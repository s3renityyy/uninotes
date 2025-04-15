import { useEffect, useState } from "react";
import getListOfUpdates from "../requests/main.requests.ts";
import ContentEditor from "../components/ContentEditor/ContentEditor.tsx";
import { ContentItem } from "../components/ContentEditor/ContentEditor.tsx";

const MainPage = () => {
  const [updates, setUpdates] = useState<ContentItem[]>([]);

  useEffect(() => {
    const fetchUpdates = async () => {
      const res = await getListOfUpdates();
      setUpdates(res || []);
    };

    fetchUpdates();
  }, []);

  return (
    <>
      <span>Главная</span>
      <ContentEditor isEditable={false} updates={updates} />
    </>
  );
};

export default MainPage;
