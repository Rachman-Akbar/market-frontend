function Stars({ value = 0, size = "h-4 w-4" }) {
  const rating = Number(value || 0);
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} className={`${size} ${index < Math.round(rating) ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatReviewDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

export function ReviewSection({ reviews = [], summary = null, loading = false }) {
  const rows = Array.isArray(reviews) ? reviews : [];
  const average = Number(summary?.average || summary?.rating || 0);
  const total = Number(summary?.total || summary?.count || rows.length || 0);
  const counts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: rows.filter((row) => Math.round(Number(row.rating || 0)) === rating).length,
  }));

  return (
    <section className="mt-8 border border-slate-200 bg-white">
      <header className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h2 className="text-base font-extrabold text-slate-950">Ulasan dan Rating Produk</h2>
        <p className="mt-1 text-xs text-slate-500">Penilaian hanya berasal dari buyer yang menyelesaikan atau menerima pesanan.</p>
      </header>

      <div className="grid gap-6 p-5 lg:grid-cols-[240px_1fr]">
        <div className="border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-end gap-2">
            <strong className="text-4xl font-extrabold text-slate-950">{average.toFixed(1)}</strong>
            <span className="pb-1 text-sm font-semibold text-slate-500">/ 5.0</span>
          </div>
          <div className="mt-2"><Stars value={average} size="h-5 w-5" /></div>
          <p className="mt-2 text-sm font-semibold text-slate-600">{total} ulasan pembeli</p>
          <div className="mt-5 grid gap-2">
            {counts.map((item) => {
              const width = rows.length ? Math.round((item.count / rows.length) * 100) : 0;
              return (
                <div key={item.rating} className="grid grid-cols-[18px_1fr_28px] items-center gap-2 text-xs text-slate-600">
                  <span>{item.rating}</span>
                  <div className="h-1.5 overflow-hidden bg-slate-200"><div className="h-full bg-amber-400" style={{ width: `${width}%` }} /></div>
                  <span className="text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          
          {!loading && rows.length ? (
            <div className="divide-y divide-slate-100">
              {rows.map((review) => (
                <article key={review.id} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{review.customer_name || review.user_name || review.buyer_name || "Pembeli"}</p>
                      <div className="mt-1"><Stars value={Number(review.rating || 0)} /></div>
                    </div>
                    <time className="text-xs text-slate-400">{formatReviewDate(review.created_at)}</time>
                  </div>
                  {review.variant_name || review.sku ? <p className="mt-2 text-xs text-slate-500">Varian: {review.variant_name || review.sku}</p> : null}
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{review.comment || review.review || "Pembeli memberikan rating tanpa komentar."}</p>
                </article>
              ))}
            </div>
          ) : null}
          {!loading && !rows.length ? <div className="flex min-h-40 items-center justify-center border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">Belum ada ulasan untuk produk ini.</div> : null}
        </div>
      </div>
    </section>
  );
}
