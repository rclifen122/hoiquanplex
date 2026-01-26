import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer, PartnersSection } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-plex-dark text-white selection:bg-plex-yellow selection:text-black">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <PartnersSection />
        <AboutSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
