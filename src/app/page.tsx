import { LandingPage } from "@/components/home/landing-page";
import { getAllArticles } from "@/lib/get-articles";

// Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

export default async function Home() {
  // Fetch articles server-side for fast initial render
  const allArticles = await getAllArticles();

  return <LandingPage allArticles={allArticles} />;
}
