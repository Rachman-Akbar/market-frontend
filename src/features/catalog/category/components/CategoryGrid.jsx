import { Link } from "react-router-dom";
import { catalogGroups } from "@/shared/data/mockData";

export function CategoryGrid() {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Kategori Populer</h2>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {catalogGroups.map((g) => (
          <Link
            key={g.id} to={`/category/${g.slug}`}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all group"
          >
            <span className="text-3xl">{g.icon}</span>
            <span className="text-xs text-gray-700 text-center leading-tight group-hover:text-orange-500 transition-colors">
              {g.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
