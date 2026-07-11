function Stars({ value = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className={`w-3 h-3 ${index < value ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewSection({ reviews = [], summary = null }) {
  const rows = Array.isArray(reviews) ? reviews : [];
  const average = Number(summary?.average || summary?.rating || 0);
  const total = Number(summary?.total || summary?.count || rows.length || 0);

  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      <h2 className="text-lg font-bold mb-4">ULASAN PEMBELI</h2>

      {total > 0 ? (
        <div className="flex flex-col gap-6 mb-8 p-6 border border-gray-100 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <div>
              <div className="text-4xl font-bold text-gray-800">
                {average.toFixed(1)}<span className="text-lg text-gray-400 font-normal ml-1">/ 5.0</span>
              </div>
              <div className="text-sm text-gray-500">{total} ulasan</div>
            </div>
          </div>
        </div>
      ) : null}

      {rows.length ? (
        <div className="space-y-6">
          {rows.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <Stars value={Number(review.rating || 0)} />
                {review.created_at ? <span className="text-xs text-gray-400">{review.created_at}</span> : null}
              </div>
              <div className="text-xs font-bold mb-2">{review.customer_name || review.user_name || "Pembeli"}</div>
              <p className="text-sm whitespace-pre-line">{review.comment || review.review || ""}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-100 rounded-xl bg-white p-8 text-center text-sm text-gray-500">
          Belum ada ulasan untuk produk ini.
        </div>
      )}
    </div>
  );
}
