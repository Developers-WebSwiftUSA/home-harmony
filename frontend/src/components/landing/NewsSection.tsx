import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsCard from "@/components/news/NewsCard";
import { newsService } from "@/services/news.service";

const NewsSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-news", "home"],
    queryFn: () => newsService.listPublic({ limit: 3 }),
  });

  const articles = data?.data || [];

  return (
    <section className="section-padding bg-muted">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Blog & News</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              Our Latest News Update
            </h2>
          </div>
          <Link to="/news" className="mt-4 md:mt-0 w-fit">
            <Button>See All News</Button>
          </Link>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading news...</p>
        ) : articles.length === 0 ? (
          <div className="bg-card rounded-xl p-10 text-center border border-border">
            <Newspaper className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No news has been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <NewsCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
