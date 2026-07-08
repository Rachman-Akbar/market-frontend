import { useMemo, useState } from "react";
import { Lock, MoreVertical, Paperclip, Search, Send, Smile, Users, UsersRound } from "lucide-react";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import { groupThreads } from "@/features/profile/data/profileMarketplaceData";
import { cn } from "@/shared/utils/utils";

export default function GroupChatPage() {
  const [activeId, setActiveId] = useState(groupThreads[0]?.id || "");
  const [draft, setDraft] = useState("");
  const activeGroup = useMemo(() => groupThreads.find((group) => group.id === activeId), [activeId]);

  return (
    <div className={profileLayout.page}>
      <aside className={profileLayout.sidebar}>
        <div className={profileLayout.sidebarHeader}>
          <h1 className={profileLayout.sidebarTitle}>Grup Komunitas</h1>
          <div className="flex items-center gap-3 text-slate-500">
            <button type="button" className="transition hover:text-[#ee4d2d]" aria-label="Buat grup"><Users size={20} /></button>
            <button type="button" className="transition hover:text-[#ee4d2d]" aria-label="Menu"><MoreVertical size={20} /></button>
          </div>
        </div>

        <div className={profileLayout.sidebarSearch}>
          <label className="flex h-10 w-full items-center rounded-lg bg-[#f0f2f5] px-3">
            <Search size={16} className="mr-3 shrink-0 text-slate-400" />
            <input type="search" placeholder="Cari atau mulai grup baru" className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
          </label>
        </div>

        <div className={profileLayout.filterRow}>
          <button type="button" className="shrink-0 rounded-full bg-[#fff1ec] px-3 py-1 font-semibold text-[#ee4d2d]">Semua Grup</button>
          <button type="button" className="shrink-0 rounded-full bg-[#f0f2f5] px-3 py-1 font-semibold text-slate-500 transition hover:bg-[#fff1ec] hover:text-[#ee4d2d]">Belum dibaca</button>
        </div>

        <div className={profileLayout.listScroll}>
          {groupThreads.map((group) => {
            const active = group.id === activeId;

            return (
              <button key={group.id} type="button" onClick={() => setActiveId(group.id)} className={cn(profileLayout.listItem, active ? "bg-[#fff7f3]" : "hover:bg-[#f7f8fa]")}>
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white", group.avatar)}>{group.initials}</div>
                <div className="min-w-0 pt-0.5">
                  <p className="truncate text-sm font-semibold text-slate-950">{group.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{group.lastMessage}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{group.memberCount} anggota</p>
                </div>
                <div className="flex flex-col items-end gap-2 pt-0.5">
                  <span className={cn("text-[11px] font-medium", group.unread > 0 ? "text-[#ee4d2d]" : "text-slate-400")}>{group.time}</span>
                  {group.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ee4d2d] px-1.5 text-[11px] font-bold text-white">{group.unread}</span>}
                </div>
                <hr className={profileLayout.listDivider} />
              </button>
            );
          })}
        </div>
      </aside>

      <section className={profileLayout.chatPanel}>
        {activeGroup ? (
          <>
            <header className={profileLayout.chatHeader}>
              <div className="flex min-w-0 items-center">
                <div className={cn("mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white", activeGroup.avatar)}>{activeGroup.initials}</div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-slate-950">{activeGroup.name}</h2>
                  <p className="truncate text-xs text-slate-400">{activeGroup.status} • {activeGroup.memberCount} anggota</p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-slate-500">
                <button type="button" className="transition hover:text-[#ee4d2d]" aria-label="Cari"><Search size={20} /></button>
                <button type="button" className="transition hover:text-[#ee4d2d]" aria-label="Menu"><MoreVertical size={20} /></button>
              </div>
            </header>

            <div className={profileLayout.chatBody}>
              <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(18,18,18,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
              <div className="relative mx-auto mb-5 flex w-fit items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs text-slate-400 shadow-sm">
                <Lock size={13} />
                Pesan grup terenkripsi secara end-to-end
              </div>
              <div className="relative flex flex-col gap-2">
                {activeGroup.messages.map((message) => {
                  const mine = message.role === "me";

                  return (
                    <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[78%] px-4 py-2 text-sm leading-6 shadow-sm", mine ? "rounded-l-2xl rounded-tr-2xl bg-[#d9fdd3] text-slate-900" : "rounded-r-2xl rounded-tl-2xl bg-white text-slate-800")}>
                        {!mine && <p className="mb-1 text-[11px] font-bold text-[#ee4d2d]">{message.sender}</p>}
                        <p>{message.text}</p>
                        <time className="mt-1 block text-right text-[10px] font-medium text-slate-400">{message.time}</time>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <footer className={profileLayout.chatFooter}>
              <button type="button" className="text-slate-500 transition hover:text-[#ee4d2d]" aria-label="Lampiran"><Paperclip size={20} /></button>
              <button type="button" className="text-slate-500 transition hover:text-[#ee4d2d]" aria-label="Emoji"><Smile size={20} /></button>
              <form
                className="flex flex-1 items-center"
                onSubmit={(event) => {
                  event.preventDefault();
                  setDraft("");
                }}
              >
                <input value={draft} onChange={(event) => setDraft(event.target.value)} type="text" placeholder="Ketik pesan grup" className="h-10 w-full rounded-lg border-0 bg-[#f0f2f5] px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400" />
              </form>
              <button type="submit" className="text-[#ee4d2d] transition hover:text-[#d73211]" aria-label="Kirim"><Send size={20} /></button>
            </footer>
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <div className="max-w-md">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0f2f5] text-slate-400"><UsersRound size={40} /></div>
              <h2 className="mb-2 text-2xl font-light text-slate-950">Grup Marketplace</h2>
              <p className="text-sm leading-6 text-slate-500">Pilih grup di sebelah kiri untuk mulai berdiskusi dengan komunitas atau tim.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
