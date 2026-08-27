import { useQuery } from "@tanstack/react-query";
import { Newspaper } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import NewsCard from "@/components/news/NewsCard";
import { newsService } from "@/services/news.service";
import heroBg from "@/assets/hero-bg.jpg";

const News = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-news"],
    queryFn: () => newsService.listPublic({ limit: 48 }),
  });

  const articles = data?.data || [];

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
          {isLoading ? (
            <p className="text-center text-muted-foreground py-12">Loading news...</p>
          ) : articles.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No news has been published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <NewsCard key={article._id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
