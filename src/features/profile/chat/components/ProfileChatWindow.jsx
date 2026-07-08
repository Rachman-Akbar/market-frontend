import { cn } from "@/shared/utils/utils";

export function ProfileChatWindow({ thread }) {
  if (!thread) {
    return (
      <div className="flex min-h-[620px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
        Pilih percakapan untuk mulai melihat pesan.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 bg-[#f0f2f5] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-extrabold text-emerald-700">
            {thread.store.slice(0, 1)}
            <span className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white", thread.status === "online" ? "bg-emerald-500" : "bg-slate-300")} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-950">{thread.store}</h2>
            <p className="text-xs capitalize text-slate-500">{thread.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <button className="rounded-full p-2 transition hover:bg-white"><span className="material-symbols-outlined text-[20px]">call</span></button>
          <button className="rounded-full p-2 transition hover:bg-white"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>
        </div>
      </header>

      <div className="min-h-[500px] space-y-3 bg-[#efeae2] p-5">
        {thread.messages.map((message) => {
          const mine = message.sender === "me";

          return (
            <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[78%] rounded-2xl px-4 py-2 text-sm leading-6 shadow-sm", mine ? "bg-[#d9fdd3] text-slate-900" : "bg-white text-slate-800")}>
                <p>{message.text}</p>
                <p className="mt-1 text-right text-[10px] text-slate-400">{message.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="flex items-center gap-2 border-t border-slate-100 bg-[#f0f2f5] p-4">
        <button className="rounded-full p-2 text-slate-500 transition hover:bg-white"><span className="material-symbols-outlined">attach_file</span></button>
        <input placeholder="Tulis pesan" className="h-11 flex-1 rounded-full border border-transparent bg-white px-4 text-sm outline-none focus:border-emerald-500" />
        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700">
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </footer>
    </section>
  );
}
