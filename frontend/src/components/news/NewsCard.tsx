import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import type { NewsArticle } from "@/types/news";
import { formatNewsDate, resolveNewsImage } from "@/lib/newsDisplay";
import { cn } from "@/lib/utils";

type Props = {
  article: NewsArticle;
  className?: string;
};

const NewsCard = ({ article, className }: Props) => {
  const href = `/news/${article.slug || article._id}`;
  return (
    <Link
      to={href}
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group block",
        className
      )}
    >
      <div className="h-48 overflow-hidden">
        <img
          src={resolveNewsImage(article.image)}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{article.category || "News"}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatNewsDate(article.publishedAt)}
          </span>
        </div>
        <h3 className="font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">By {article.authorName || "Admin"}</span>
          <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Read More <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
