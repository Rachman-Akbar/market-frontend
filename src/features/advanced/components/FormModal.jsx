import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { Button } from "@/shared/components/ui/Button";

export function FormModal({ open, title, subtitle, children, onClose, onSubmit, busy, submitLabel = "Simpan", dangerAction }) {
  return (
    <CrudDialog presentation="page" open={open} title={title} subtitle={subtitle} onClose={onClose}>
      <form onSubmit={onSubmit} className="border border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-950">{title}</h2>
            {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-200" aria-label="Tutup halaman data">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="grid gap-4 p-5 sm:p-6">{children}</div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <div>{dangerAction}</div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={busy}>{busy ? "Memproses..." : submitLabel}</Button>
          </div>
        </div>
      </form>
    </CrudDialog>
  );
}

export function Field({ label, children, hint, required = false, error = "" }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
      <span>{label}{required ? <span className="ml-1 text-red-500">*</span> : null}</span>
      {children}
      {error ? <span className="text-xs font-semibold text-red-600">{error}</span> : hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}
