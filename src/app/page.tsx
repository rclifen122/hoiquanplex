import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer, PartnersSection } from '@/components/landing/Footer';

export default async function HomePage() {

  const customer = await getCustomer();

  return (
    <div className="min-h-screen bg-plex-dark text-white selection:bg-plex-yellow selection:text-black">
      <Header customer={customer} />

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
