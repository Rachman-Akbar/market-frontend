import { cn } from "@/shared/utils/utils";

export function ProfileChatList({ threads = [], activeId, onSelect }) {
  return (
    <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">search</span>
          <input placeholder="Cari chat" className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
        </div>
      </div>
      <div className="max-h-[620px] overflow-y-auto">
        {threads.map((thread) => {
          const active = thread.id === activeId;

          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => onSelect(thread.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition last:border-b-0",
                active ? "bg-emerald-50" : "bg-white hover:bg-slate-50"
              )}
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-extrabold text-emerald-700">
                {thread.store.slice(0, 1)}
                <span className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white", thread.status === "online" ? "bg-emerald-500" : "bg-slate-300")} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-extrabold text-slate-900">{thread.store}</p>
                  <span className="text-[11px] text-slate-400">{thread.time}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{thread.lastMessage}</p>
              </div>
              {thread.unread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white">{thread.unread}</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
