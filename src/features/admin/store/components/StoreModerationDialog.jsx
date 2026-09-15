import { memo, useEffect, useState } from "react";

const MODERATION_TEMPLATES = {
  approved: {
    subject: "Toko Anda Telah Disetujui",
    message:
      "Halo {owner_name}!\n\nSelamat, toko \"{store_name}\" Anda telah disetujui oleh tim Marketplace dan kini resmi aktif. Anda sudah dapat mulai menjual produk dan menerima pesanan.\n\nTerima kasih telah bergabung bersama kami. 🎉",
  },
  suspended: {
    subject: "Toko Anda Diberhentikan Sementara",
    message:
      "Halo {owner_name}.\n\nDengan ini kami informasikan bahwa toko \"{store_name}\" untuk sementara diberhentikan karena diduga melanggar ketentuan Marketplace. Segala aktivitas penjualan pada toko tersebut dihentikan.\n\nSilakan hubungi tim Marketplace melalui chat ini untuk informasi lebih lanjut.\n\n{reason}",
  },
};

function previewTemplate(template, store) {
  if (!store) return template;
  return template
    .replaceAll("{store_name}", store.name || "")
    .replaceAll("{owner_name}", store.ownerName || "")
    .replaceAll("{reason}", "");
}

export const StoreModerationDialog = memo(function StoreModerationDialog({
  open,
  action = "approved",
  stores = [],
  pending = false,
  onConfirm,
  onClose,
}) {
  const [useCustom, setUseCustom] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const template = MODERATION_TEMPLATES[action] || MODERATION_TEMPLATES.approved;
  const preview = useCustom
    ? customMessage || "(Pesan kosong)"
    : previewTemplate(template.message, stores[0]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (event.key === "Escape" && !pending) onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open, pending]);

  if (!open) return null;

  const actionLabel = action === "approved" ? "Approve" : "Suspend";
  const dangerStyle = action === "suspended";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Moderasi Toko</h2>
            <p className="mt-1 text-sm text-slate-500">
              {stores.length === 1
                ? `"${stores[0].name}" akan di-${actionLabel.toLowerCase()}.`
                : `${stores.length} toko akan di-${actionLabel.toLowerCase()}.`}
            </p>
          </div>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-extrabold ${
              dangerStyle ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-700"
            }`}
          >
            {actionLabel}
          </span>
        </div>

        <label className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={!useCustom}
            onChange={(event) => {
              setUseCustom(!event.target.checked);
            }}
            className="h-4 w-4 rounded border-slate-300 text-teal-600"
          />
          Gunakan template default
        </label>

        {useCustom && (
          <div className="mt-3">
            <label className="text-xs font-extrabold text-slate-700">Pesan custom</label>
            <textarea
              value={customMessage}
              onChange={(event) => setCustomMessage(event.target.value)}
              rows={5}
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
              placeholder="Ketik pesan manual. Gunakan {store_name}, {owner_name} jika perlu."
            />
          </div>
        )}

        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Preview pesan yang dikirim</p>
          <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600 max-h-40 overflow-y-auto">{preview}</p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:border-slate-300 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => onConfirm(useCustom ? customMessage : null)}
            className={`h-10 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-60 ${
              dangerStyle
                ? "bg-red-600 hover:bg-red-700"
                : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {pending ? "Mengirim..." : `${actionLabel} & Kirim Pesan`}
          </button>
        </div>
      </div>
    </div>
  );
});