import { LandingPage } from "@/components/landing-page";
import { getAllArticles } from "@/lib/get-articles";

// Revalidate every 6 hours (21600 seconds)
export const revalidate = 21600;

export default async function Home() {
  // Fetch articles server-side for fast initial render
  const allArticles = await getAllArticles();

  return <LandingPage allArticles={allArticles} />;
}
