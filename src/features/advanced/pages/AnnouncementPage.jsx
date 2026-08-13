import { useState } from "react";
import { advancedError, useSendAnnouncement } from "@/features/advanced/services/advancedMarketplaceService";
import { Field } from "@/features/advanced/components/FormModal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

export default function AnnouncementPage() {
  const [form, setForm] = useState({ subject: "", message: "", target_role: "seller", user_ids: "", attachments: "" });
  const [notice, setNotice] = useState("");
  const mutation = useSendAnnouncement();

  async function submit(event) {
    event.preventDefault();
    try {
      await mutation.mutateAsync({
        subject: form.subject,
        message: form.message,
        target_role: form.target_role || null,
        user_ids: form.user_ids.split(",").map((value) => value.trim()).filter(Boolean),
        attachments: form.attachments.split("\n").map((value) => value.trim()).filter(Boolean),
      });
      setNotice("Announcement berhasil dikirim dan masuk ke chat penerima.");
      setForm((current) => ({ ...current, subject: "", message: "", user_ids: "", attachments: "" }));
    } catch (error) {
      setNotice(advancedError(error));
    }
  }

  return (
    <section className="space-y-3">
      <header className="border border-slate-200 bg-white p-4"><h1 className="text-lg font-black text-slate-950">Announcement</h1><p className="mt-1 text-sm text-slate-500">Kirim peringatan, pelanggaran, atau pengumuman penting kepada seller, buyer, atau user tertentu.</p></header>
      {notice ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</p> : null}
      <form onSubmit={submit} className="grid gap-4 border border-slate-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Target Role"><select value={form.target_role} onChange={(event) => setForm((current) => ({ ...current, target_role: event.target.value }))} className="h-10 border border-slate-300 px-3"><option value="seller">Seller</option><option value="buyer">Buyer</option><option value="">Hanya User ID</option></select></Field><Field label="User ID Spesifik"><Input value={form.user_ids} onChange={(event) => setForm((current) => ({ ...current, user_ids: event.target.value }))} placeholder="UUID dipisahkan koma" /></Field></div>
        <Field label="Subjek"><Input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} required /></Field>
        <Field label="Pesan"><textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} className="min-h-40 border border-slate-300 p-3 text-sm" required /></Field>
        <Field label="Lampiran URL"><textarea value={form.attachments} onChange={(event) => setForm((current) => ({ ...current, attachments: event.target.value }))} className="min-h-20 border border-slate-300 p-3 text-sm" placeholder="Satu URL per baris" /></Field>
        <div className="flex justify-end"><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Mengirim..." : "Kirim Announcement"}</Button></div>
      </form>
    </section>
  );
}
