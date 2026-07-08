const REVIEW_PHOTOS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBYZZuLIlB3v4et4MRykhJk0cpMiREjHZzRUxu1-_fbskI9pL--WGRP1l54m0wYmG5UkpRj3vct4ffHSjKvLEhHfH_NXuzOpRsVYtqk3zBsGyovnIj1alSU5e9TWt7lWZ3gujNIbfMVNqR8YjXYEU7LVLTvIGk60knfwFgisIObDJ29N1HMkPSiOQM3wje4xrwMADBXBUd2botJHOS24uzUgl1Y7s0rUfnR1iYilNZ8JAFYfxpJsZ9V62atdUv8lxXnLfEhe4EjisfE",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuClEJBp5Ci3V4TUSNMOga2SQYQpV6xA77-Pg1gPr23xbWU-tVBSkRRlqWJC2K0mKw2JkmVXWK0cVUyVpgRU14rtu5IPRyFeP1JlePYHvNHkp9-obXtxvd-h3smMZwq4T-JoY5Rjolb_matnL4dtcW_ib2-bzsE8vbLjt1P2XF6BlQ6mgs857n9fUGQ_hVWcYBilbOqPXKva6Byjtreg72p-MFXpymPKMK5gCqZrafeJ5-R0RXif63TVKmmDCM8sNiHZwYEjg8ztcciW",
];

const STAR_DIST = [
  { star: 5, count: 1801, pct: 86 },
  { star: 4, count: 222, pct: 11 },
  { star: 3, count: 49, pct: 2 },
  { star: 2, count: 14, pct: 1 },
  { star: 1, count: 10, pct: 1 },
];

function Stars({ n }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < n ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewSection() {
  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      <h2 className="text-lg font-bold mb-4">ULASAN PEMBELI</h2>

      
      <div className="flex flex-col gap-6 mb-8 p-6 border border-gray-100 rounded-xl bg-white shadow-sm">
        <div className="flex flex-wrap items-start gap-12">
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-yellow-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <div className="text-5xl font-bold text-gray-800">
                4.8<span className="text-lg text-gray-400 font-normal ml-1">/ 5.0</span>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-800 mb-1">96% pembeli merasa puas</div>
            <div className="text-sm text-gray-500">2096 rating • 1230 ulasan</div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-1">
            {STAR_DIST.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                <span className="w-3 text-gray-500">{star}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${pct > 5 ? "bg-[#03ac0e]" : "bg-gray-300"}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-gray-500 w-10">({count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <aside className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-bold text-sm mb-4">FILTER ULASAN</h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">Media</span>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-[#03ac0e] focus:ring-[#03ac0e]" />
                  Dengan Foto &amp; Video
                </label>
              </div>
              <hr className="border-gray-100" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">Rating</span>
                </div>
                <div className="space-y-2">
                  {[5, 4].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-[#03ac0e] focus:ring-[#03ac0e]" />
                      <Stars n={r} /> {r}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        
        <div className="md:col-span-3 space-y-6">
          
          <div className="mb-8">
            <h3 className="font-bold text-sm mb-4">FOTO &amp; VIDEO PEMBELI</h3>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {REVIEW_PHOTOS.map((src, i) => (
                <img key={i} src={src} alt="review" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
              ))}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                <img src={REVIEW_PHOTOS[0]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                <span className="relative">+1.007</span>
              </div>
            </div>
          </div>

          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm">ULASAN PILIHAN</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Urutkan</span>
              <button className="border border-gray-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                Paling Membantu
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100 pb-6">
            <div className="flex items-center gap-1 mb-2">
              <Stars n={5} />
              <span className="text-xs text-gray-400 ml-2">4 minggu lalu</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gray-200" />
              <span className="text-xs font-bold">R***g</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Varian: PHOENIX hitam gold - 42</p>
            <p className="text-sm mb-2">
              ukurann kegedean dikitt tapi di sengaja biarr kepake lamaa, lemmnya udahh mantap anti jebol juga,
              yang bikin aku tertarik sama sepatu ini dari yang lain tuh karna ada pla...
            </p>
            <button className="text-[#03ac0e] text-sm font-bold">Selengkapnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
