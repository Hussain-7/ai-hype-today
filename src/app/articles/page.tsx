import { ArticlesPage } from "@/components/articles-page";
import { getAllArticles } from "@/lib/get-articles";

export default async function ArticlesPageRoute() {
  // Fetch articles server-side for fast initial render
  const allArticles = await getAllArticles();

  return <ArticlesPage allArticles={allArticles} />;
}
