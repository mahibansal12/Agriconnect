import { useState } from "react";
import { mockNews } from "../../mockdata/newsMock";
import NewsCard from "../../components/news/NewsCard";
import NewsCategoryTabs from "../../components/news/NewsCategoryTabs";

function News() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredNews =
    activeCategory === "all"
      ? mockNews
      : mockNews.filter((article) => article.category === activeCategory);

  return (
    <div className="min-h-screen bg-green-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-1">Agriculture News</h1>
      <p className="text-gray-600 mb-6">Stay updated with the latest in farming, weather, and policy.</p>

      <NewsCategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />

      {filteredNews.length === 0 ? (
        <p className="text-gray-500">No articles in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => <NewsCard key={article._id} article={article} />)}
        </div>
      )}
    </div>
  );
}

export default News;