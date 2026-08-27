import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Newspaper } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { newsService } from "@/services/news.service";
import { formatNewsDate, resolveNewsImage } from "@/lib/newsDisplay";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-news", slug],
    queryFn: () => newsService.getBySlug(slug || ""),
    enabled: Boolean(slug),
    meta: { suppressErrorToast: true },
  });

  const article = data?.data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative py-12 md:py-16">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-secondary/85" />
        </div>
        <div className="relative z-10 container">
          <Link to="/news" className="inline-flex items-center gap-1 text-sm text-dark-surface-foreground/80 hover:text-dark-surface-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> All news
          </Link>
          {article ? (
            <>
              <span className="inline-block bg-primary/20 text-primary px-2 py-0.5 rounded text-xs mb-3">
                {article.category || "News"}
              </span>
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-dark-surface-foreground mb-3 max-w-4xl">
                {article.title}
              </h1>
              <p className="text-dark-surface-foreground/70 text-sm flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatNewsDate(article.publishedAt)}
                </span>
                <span>By {article.authorName || "Admin"}</span>
              </p>
            </>
          ) : (
            <h1 className="text-3xl font-heading font-bold text-dark-surface-foreground">News</h1>
          )}
        </div>
      </section>

      <section className="section-padding">
        <div className="container max-w-3xl">
          {isLoading ? (
            <p className="text-muted-foreground">Loading article...</p>
          ) : isError || !article ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">This article is not available.</p>
              <Link to="/news">
                <Button variant="outline">Back to news</Button>
              </Link>
            </div>
          ) : (
            <article>
              <img
                src={resolveNewsImage(article.image)}
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover rounded-xl mb-8"
              />
              <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">{article.content}</div>
            </article>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsDetail;
