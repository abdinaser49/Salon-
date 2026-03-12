import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import StylistsSection from "@/components/StylistsSection";
import GallerySection from "@/components/GallerySection";
import BookingModal from "@/components/BookingModal";
import Footer from "@/components/Footer";

const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const openBooking = (service?: string) => {
    if (loading) {
      toast.info("Please wait while we check your login status...");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to book an appointment.");
      navigate("/login");
      return;
    }
    setPreselectedService(service);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onBookNow={() => openBooking()} />
      <HeroSection onBookNow={() => openBooking()} />
      <ServicesSection onSelectService={(s) => openBooking(s)} />
      <GallerySection />
      <div id="team">
        <StylistsSection />
      </div>
      <Footer />
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preselectedService={preselectedService}
      />
    </div>
  );
};

export default Index;
