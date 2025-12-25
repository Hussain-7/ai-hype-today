import { ArticlesPage } from "@/components/articles/articles-page";
import { getAllArticles } from "@/lib/get-articles";

// Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

export default async function ArticlesPageRoute() {
  // Fetch articles server-side for fast initial render
  const allArticles = await getAllArticles();

  return <ArticlesPage allArticles={allArticles} />;
}
