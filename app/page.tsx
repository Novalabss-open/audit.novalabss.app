import { Hero } from '@/components/home/Hero';
import { CheckerForm } from '@/components/home/CheckerForm';
import { HowItWorks } from '@/components/home/HowItWorks';
import { WhyAccessibility } from '@/components/home/WhyAccessibility';
import { Footer } from '@/components/shared/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <CheckerForm />
      <HowItWorks />
      <WhyAccessibility />
      <Footer />
    </div>
  );
}
