import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import property1 from "@/assets/property-1.jpg";

const articles = [
  {
    image: property1,
    title: "Hello world!",
    excerpt: "Recent Real Estate Market Insights, tips on how to get the best value for your money.",
    date: "Feb 10, 2026",
    category: "Tips",
  },
  {
    image: news1,
    title: "Top 6 Amazing Places to Stay in California",
    excerpt: "Discover extraordinary living options across the Golden State from modern condos to coastal villas.",
    date: "Feb 8, 2026",
    category: "Travel",
  },
  {
    image: news2,
    title: "The crafting tool will accelerate your work",
    excerpt: "Learn how new property management tools are revolutionizing real estate for buyers and sellers.",
    date: "Feb 5, 2026",
    category: "Tools",
  },
];

const NewsSection = () => {
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
          <Button className="mt-4 md:mt-0 w-fit">See All Blog</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div
              key={article.title}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{article.category}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {article.date}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-foreground mb-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{article.excerpt}</p>
                <a href="#" className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  Read More <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
