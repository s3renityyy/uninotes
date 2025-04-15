import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchContent } from "../requests/content.requests.ts";
import ContentEditor, {
  ContentItem,
} from "../components/ContentEditor/ContentEditor";

const ContentPage = () => {
  const { section, type } = useParams();
  const [content, setContent] = useState<ContentItem[]>([]);

  useEffect(() => {
    fetchContent(section, type).then(setContent);
  }, [section, type]);

  return <ContentEditor isEditable={true} updates={content} />;
};

export default ContentPage;
