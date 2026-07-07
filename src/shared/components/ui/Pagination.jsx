export function Pagination({ current = 1, total = 5 }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#bccbb4] hover:border-[#006e04] text-[#3e4a39] transition-all">
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            page === current
              ? "bg-[#03ac0e] text-white font-bold"
              : "border border-[#bccbb4] hover:bg-[#f6f3f2]"
          }`}
        >
          {page}
        </button>
      ))}
      <span className="text-[#3e4a39]">...</span>
      <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#bccbb4] hover:border-[#006e04] text-[#3e4a39] transition-all">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
