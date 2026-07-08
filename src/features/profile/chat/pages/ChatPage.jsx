import { useEffect, useMemo, useState } from "react";
import { ProfileChatList } from "@/features/profile/chat/components/ProfileChatList";
import { ProfileChatWindow } from "@/features/profile/chat/components/ProfileChatWindow";
import { getProfileChatThreads } from "@/features/profile/chat/services/profileChatService";

export default function ChatPage() {
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
    <div className="flex h-full min-w-0 flex-1 overflow-hidden">
      <ProfileChatList threads={threads} activeId={activeId} onSelect={setActiveId} />
      <ProfileChatWindow thread={activeThread} />
    </div>
  );
}
