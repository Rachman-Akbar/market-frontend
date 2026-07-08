import { useEffect, useMemo, useState } from "react";
import { ProfileChatList } from "@/features/profile/chat/components/ProfileChatList";
import { ProfileChatWindow } from "@/features/profile/chat/components/ProfileChatWindow";
import { getProfileChatThreads } from "@/features/profile/chat/services/profileChatService";

export default function ProfileChatPage() {
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    getProfileChatThreads().then((items) => {
      setThreads(items);
      setActiveId(items[0]?.id || "");
    });
  }, []);

  const activeThread = useMemo(() => threads.find((thread) => thread.id === activeId), [threads, activeId]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-extrabold text-slate-900">Chat Penjual</h2>
        <p className="mt-1 text-sm text-slate-500">Percakapan pembeli dengan toko dibuat clean dan minimal seperti aplikasi chat modern.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <ProfileChatList threads={threads} activeId={activeId} onSelect={setActiveId} />
        <ProfileChatWindow thread={activeThread} />
      </div>
    </div>
  );
}
