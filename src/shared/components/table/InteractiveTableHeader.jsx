import { memo } from "react";
import { cn } from "@/shared/utils/utils";

export const InteractiveTableHeader = memo(function InteractiveTableHeader({
  columnKey,
  children,
  headerProps,
  style,
  onResizeStart,
  onResetWidth,
  dragging = false,
  dropTarget = false,
  className,
  align = "left",
}) {
  return (
    <th
      {...headerProps}
      style={style}
      className={cn(
        "group relative select-none whitespace-nowrap px-4 py-3 font-extrabold",
        align === "right" && "text-right",
        align === "center" && "text-center",
        dragging && "opacity-45",
        dropTarget && !dragging && "bg-emerald-50",
        className,
      )}
      title="Tarik header untuk mengubah urutan kolom. Tarik garis kanan untuk mengubah lebar."
    >
      <div className={cn("flex min-w-0 items-center gap-1.5", align === "right" && "justify-end", align === "center" && "justify-center")}>
        <span className="material-symbols-outlined shrink-0 cursor-grab text-[16px] text-slate-300 opacity-0 transition-opacity group-hover:opacity-100">drag_indicator</span>
        <div className="min-w-0 flex-1 truncate">{children}</div>
      </div>
      <button
        type="button"
        aria-label={`Ubah lebar kolom ${columnKey}`}
        onPointerDown={(event) => onResizeStart?.(event, columnKey)}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onResetWidth?.(columnKey);
        }}
        draggable={false}
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize touch-none border-0 bg-transparent p-0 outline-none before:absolute before:right-[3px] before:top-[18%] before:h-[64%] before:w-px before:bg-slate-300 before:opacity-0 before:transition-opacity hover:before:opacity-100 group-hover:before:opacity-100"
      />
    </th>
  );
});

export function InteractiveColGroup({ columns, getColumnStyle, leadingWidth = 0, trailingWidth = 0 }) {
  return (
    <colgroup>
      {leadingWidth ? <col style={{ width: leadingWidth, minWidth: leadingWidth, maxWidth: leadingWidth }} /> : null}
      {columns.map((column) => <col key={column.key} style={getColumnStyle(column.key)} />)}
      {trailingWidth ? <col style={{ width: trailingWidth, minWidth: trailingWidth, maxWidth: trailingWidth }} /> : null}
    </colgroup>
  );
}
