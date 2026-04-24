import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StepsSection from "@/components/landing/StepsSection";
import PropertiesSection from "@/components/landing/PropertiesSection";
import AdvisorsSection from "@/components/landing/AdvisorsSection";
import ExpertsSection from "@/components/landing/ExpertsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import NewsSection from "@/components/landing/NewsSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StepsSection />
      <PropertiesSection />
      <AdvisorsSection />
      <ExpertsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <NewsSection />
      <Footer />
    </div>
  );
};

export default Index;
