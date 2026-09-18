import { memo, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/utils";

export const Popover = memo(function Popover({
  trigger,
  children,
  className,
  onOpenChange,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const lastEmittedRef = useRef(false);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const emit = (next) => {
    if (lastEmittedRef.current !== next) {
      lastEmittedRef.current = next;
      onOpenChangeRef.current?.(next);
    }
  };

  const close = useCallback(() => {
    setOpen(false);
    emit(false);
  }, []);

  const toggle = useCallback(() => {
    setOpen((current) => {
      const next = !current;
      emit(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      close();
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  const state = { open, close, toggle };

  return (
    <div ref={rootRef} className="relative">
      {typeof trigger === "function" ? trigger(state) : trigger}
      <div
        className={cn(
          "absolute right-0 top-full z-[150] mt-2 origin-top-right transition-all duration-150",
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
          className,
        )}
        aria-hidden={!open}
      >
        {typeof children === "function" ? children(state) : children}
      </div>
    </div>
  );
});