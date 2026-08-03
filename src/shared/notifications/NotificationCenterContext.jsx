import { createContext, useCallback, useContext, useMemo, useState } from "react";

const NotificationCenterContext = createContext(null);

function createItem(input = {}) {
  return {
    id: input.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: input.type || "info",
    title: input.title || "Informasi",
    message: input.message || "",
    status: input.status || "done",
    progress: Number.isFinite(input.progress) ? input.progress : null,
    createdAt: input.createdAt || new Date().toISOString(),
    actionLabel: input.actionLabel || "",
    onAction: input.onAction || null,
    secondaryActionLabel: input.secondaryActionLabel || "",
    onSecondaryAction: input.onSecondaryAction || null,
  };
}

export function NotificationCenterProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("queue");

  const push = useCallback((input) => {
    const item = createItem(input);
    setItems((current) => [item, ...current].slice(0, 100));
    return item.id;
  }, []);

  const update = useCallback((id, values) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...values } : item));
  }, []);

  const remove = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback((tab) => {
    if (!tab) {
      setItems([]);
      return;
    }
    setItems((current) => current.filter((item) => {
      const queued = ["processing", "waiting"].includes(item.status);
      return tab === "queue" ? !queued : queued;
    }));
  }, []);

  const startTask = useCallback((input = {}) => {
    const id = push({ ...input, status: "processing", type: input.type || "queue" });
    setActiveTab("queue");
    return {
      id,
      success(message, extra = {}) {
        update(id, { status: "done", type: "success", message, progress: 100, ...extra });
      },
      fail(message, extra = {}) {
        update(id, { status: "failed", type: "error", message, progress: null, ...extra });
      },
      progress(progress, message) {
        update(id, { progress, ...(message ? { message } : {}) });
      },
    };
  }, [push, update]);

  const queueItems = useMemo(() => items.filter((item) => ["processing", "waiting"].includes(item.status)), [items]);
  const infoItems = useMemo(() => items.filter((item) => !["processing", "waiting"].includes(item.status)), [items]);

  const value = useMemo(() => ({
    items,
    queueItems,
    infoItems,
    open,
    activeTab,
    setOpen,
    setActiveTab,
    push,
    update,
    remove,
    clear,
    startTask,
  }), [activeTab, clear, infoItems, items, open, push, queueItems, remove, startTask, update]);

  return <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>;
}

export function useNotificationCenter() {
  const context = useContext(NotificationCenterContext);
  if (!context) throw new Error("useNotificationCenter harus digunakan di dalam NotificationCenterProvider");
  return context;
}
