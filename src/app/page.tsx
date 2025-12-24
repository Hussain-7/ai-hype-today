import { LandingPage } from "@/components/landing-page";
import { getAllArticles } from "@/lib/get-articles";

export default async function Home() {
  // Fetch articles server-side for fast initial render
  const allArticles = await getAllArticles();

  return <LandingPage allArticles={allArticles} />;
}
