import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapCollection } from "@/core/utils/apiClient";

const chatPath = String(import.meta.env.VITE_CHAT_API_PATH || "").trim();
const groupPath = String(import.meta.env.VITE_GROUP_CHAT_API_PATH || "").trim();

function normalizeThread(thread = {}) {
  const messages = Array.isArray(thread.messages) ? thread.messages : [];
  const name = thread.store_name || thread.name || thread.title || "Percakapan";
  return {
    id: String(thread.id),
    store: name,
    name,
    initials: name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase(),
    avatar: "from-slate-500 to-slate-700",
    status: thread.status || "offline",
    lastMessage: thread.last_message || messages.at(-1)?.text || "",
    unread: Number(thread.unread_count || 0),
    time: thread.updated_at ? new Date(thread.updated_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "",
    memberCount: Number(thread.member_count || 0),
    messages: messages.map((message) => ({
      id: String(message.id),
      sender: message.sender_name || message.sender || "User",
      role: message.is_mine ? "me" : "store",
      text: message.message || message.text || "",
      time: message.created_at ? new Date(message.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "",
    })),
  };
}

async function getThreads(path) {
  if (!path) return [];
  const response = await apiClient.get(path);
  return unwrapCollection(response.data).map(normalizeThread);
}

export function useProfileChatThreads() {
  return useQuery({
    queryKey: ["profile", "chat", chatPath || "disabled"],
    queryFn: () => getThreads(chatPath),
    staleTime: 30000,
  });
}

export function useGroupChatThreads() {
  return useQuery({
    queryKey: ["profile", "group-chat", groupPath || "disabled"],
    queryFn: () => getThreads(groupPath),
    staleTime: 30000,
  });
}
