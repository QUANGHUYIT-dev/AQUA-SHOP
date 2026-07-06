import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";
import HeroBannerCarousel from "@/components/features/home/HeroBannerCarousel";
import ServiceHighlightsBar from "@/components/features/home/ServiceHighlightsBar";
import HomeCategorySections from "@/components/features/home/HomeCategorySections";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroBannerCarousel />
        <ServiceHighlightsBar />
        <HomeCategorySections />
      </main>
      <Footer />
    </>
  );
}
