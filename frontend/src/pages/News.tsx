import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const articles = [
  { id: 1, image: property1, title: "Hello world!", excerpt: "Recent Real Estate Market Insights, tips on how to get the best value for your money.", date: "Feb 10, 2026", category: "Tips", author: "Admin" },
  { id: 2, image: news1, title: "Top 6 Amazing Places to Stay in California", excerpt: "Discover extraordinary living options across the Golden State from modern condos to coastal villas.", date: "Feb 8, 2026", category: "Travel", author: "Savannah N." },
  { id: 3, image: news2, title: "The crafting tool will accelerate your work", excerpt: "Learn how new property management tools are revolutionizing real estate for buyers and sellers.", date: "Feb 5, 2026", category: "Tools", author: "Andrew B." },
  { id: 4, image: property2, title: "How to Stage Your Home for a Quick Sale", excerpt: "Expert tips on presenting your property to attract more buyers and close deals faster.", date: "Feb 3, 2026", category: "Selling", author: "Kathryn M." },
  { id: 5, image: property3, title: "Understanding Mortgage Rates in 2026", excerpt: "A comprehensive guide to current mortgage trends and how they affect your buying power.", date: "Feb 1, 2026", category: "Finance", author: "Admin" },
  { id: 6, image: news1, title: "Smart Home Technology Trends", excerpt: "Explore the latest smart home innovations that increase property value and improve daily living.", date: "Jan 28, 2026", category: "Technology", author: "Andrew B." },
];

const News = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative py-16 md:py-20">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-secondary/85" />
        </div>
        <div className="relative z-10 container text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-dark-surface-foreground mb-4">News & Blog</h1>
          <p className="text-dark-surface-foreground/70">Stay updated with the latest in real estate</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div key={article.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="h-48 overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{article.category}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{article.date}</span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">By {article.author}</span>
                    <a href="#" className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
