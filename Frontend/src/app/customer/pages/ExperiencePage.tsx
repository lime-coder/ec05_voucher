import { useNavigate } from "react-router";
import { VoucherCard, Voucher } from "../components/VoucherCard";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, UtensilsCrossed, Plane, Sparkles, Tv, Dumbbell, Car } from "lucide-react";
import { Button } from "@voucherhub/ui";

const trendingVouchers: Voucher[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1771508558500-f410039d7fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50JTIwZGluaW5nJTIwZm9vZCUyMGV4cGVyaWVuY2V8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "FOOD",
    name: "Premium Weekend Seafood Buffet for Two",
    partner: "The Grand Waterfront Hotel",
    price: 89,
    originalPrice: 178,
    discount: 50,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1630595633877-9918ee257288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2UlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "SPA",
    name: "Grand Bliss Royal Massage & Hydro-Aromatherapy (90 Min)",
    partner: "Ethereal Zen Wellness Spa",
    price: 129,
    originalPrice: 245,
    discount: 47,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1762742316793-b1845065429a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc29ydCUyMHZhY2F0aW9uJTIwdHJhdmVsfGVufDF8fHx8MTc3OTM1OTU4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "TRAVEL",
    name: "3 Days 2 Nights Resort Package with Breakfast",
    partner: "Paradise Beach Resort & Spa",
    price: 299,
    originalPrice: 599,
    discount: 50,
  },
];

const categories = [
  { icon: UtensilsCrossed, label: "Food & Dining" },
  { icon: Plane, label: "Travel" },
  { icon: Sparkles, label: "Spa & Beauty" },
  { icon: Tv, label: "Entertainment" },
  { icon: Dumbbell, label: "Fitness" },
  { icon: Car, label: "Automotive" },
];

const carouselItems = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1762742316793-b1845065429a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc29ydCUyMHZhY2F0aW9uJTIwdHJhdmVsfGVufDF8fHx8MTc3OTM1OTU4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Escape to Paradise",
    description: "Up to 60% off on Luxury Resort Stays",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1630595633877-9918ee257288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2UlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Find Your Zen",
    description: "Exclusive Spa Deals for Ultimate Relaxation",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1771508558500-f410039d7fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50JTIwZGluaW5nJTIwZm9vZCUyMGV4cGVyaWVuY2V8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Culinary Adventures",
    description: "Dine at the City's Best Restaurants",
  }
];

export function ExperiencePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 w-full">
        {/* Interactive Hero Carousel */}
        <section className="relative w-full h-[600px] overflow-hidden">
          {carouselItems.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white p-6 max-w-3xl">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">{item.title}</h1>
                  <p className="text-xl md:text-2xl mb-8 drop-shadow-md">{item.description}</p>
                  <Button 
                    onClick={() => navigate("/search")}
                    className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-8 py-6 rounded-full text-lg shadow-xl"
                  >
                    View Offers
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Controls */}
          <button 
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {carouselItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Category Grid */}
        <section className="max-w-[1440px] mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => navigate("/search?q=" + category.label)}
                className="group flex flex-col items-center gap-4 p-6 bg-secondary/50 rounded-2xl hover:bg-primary/10 hover:shadow-lg transition-all"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <category.icon className="w-8 h-8 text-primary" />
                </div>
                <span className="text-sm font-bold text-foreground">
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Trending Near You */}
        <section className="bg-secondary/30 py-16">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Trending Near You</h2>
              <Button variant="outline" onClick={() => navigate("/search")} className="border-2 font-semibold">
                See More
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingVouchers.map((voucher) => (
                <VoucherCard key={voucher.id} voucher={voucher} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
