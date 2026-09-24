import { useEffect, useMemo, useState } from "react";
import { CrudDialog, FormActionDock, FormEditorLayout } from "@/shared/components/crud";
import { FormField, inputClassName, textAreaClassName } from "@/shared/components/form/FormField";
import { required, validateFields } from "@/core/utils/formValidation";
import { useFormDirty } from "@/shared/hooks/useFormDirty";
import { toastError, toastSuccess } from "@/shared/utils/userFeedback";
import { cn } from "@/shared/utils/utils";
import {
  TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  RECURRENCE_OPTIONS,
  STATUS_OPTIONS,
} from "../constants";
import { useCreateSchedule, useUpdateSchedule, plannerError } from "../services/plannerService";

function initialValues(entity) {
  return {
    title: entity?.title || "",
    description: entity?.description || "",
    type: entity?.type || "task",
    priority: entity?.priority || "normal",
    color: entity?.color || "",
    date: entity?.date || "",
    label: entity?.label || "",
    assignee: entity?.assignee || "",
    status: entity?.status || "todo",
    recurrence: entity?.recurrence || "none",
    start_time: entity?.start_time || "",
    end_time: entity?.end_time || "",
    is_all_day: entity?.is_all_day ?? true,
  };
}

function buildValues(entity, defaultValues) {
  if (entity) return initialValues(entity);
  return { ...initialValues(null), ...(defaultValues || {}) };
}

export function ScheduleForm({ open, entity, defaultValues = null, extraCreatePayload = null, onClose, onSaved, onDelete }) {
  const pristine = useMemo(() => buildValues(entity, defaultValues), [defaultValues, entity]);
  const [values, setValues] = useState(pristine);
  const [errors, setErrors] = useState({});
  const dirty = useFormDirty(pristine, values);
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const mutation = entity ? updateMutation : createMutation;

  useEffect(() => {
    if (open) {
      setValues(buildValues(entity, defaultValues));
      setErrors({});
    }
  }, [defaultValues, entity, open]);

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields(values, {
      title: required("Judul"),
      date: required("Tanggal"),
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      label: values.label.trim(),
      assignee: values.assignee.trim(),
      start_time: values.start_time || null,
      end_time: values.end_time || null,
    };

    try {
      const saved = entity
        ? await updateMutation.mutateAsync({ id: entity.id, values: payload })
        : await createMutation.mutateAsync({ ...payload, ...(extraCreatePayload || {}) });
      onSaved?.(saved);
      toastSuccess(entity ? "Jadwal diperbarui." : "Jadwal ditambahkan.");
      window.setTimeout(() => onClose?.(), 350);
    } catch (error) {
      toastError("Gagal menyimpan jadwal", plannerError(error));
    }
  };

  const saveDisabled = mutation.isPending || !dirty;

  return (
    <CrudDialog open={open} onClose={onClose} title={entity ? "Edit Jadwal" : "Jadwal Baru"} size="max-w-3xl">
      <form onSubmit={submit}>
        <FormEditorLayout
          contentClassName="max-w-3xl"
          actions={(
            <FormActionDock
              tone="emerald"
              save={{ icon: "save", label: entity ? "Simpan" : "Buat Jadwal" }}
              disabled={saveDisabled}
              onDelete={entity && onDelete ? () => onDelete(entity) : undefined}
            />
          )}
        >
          <div className="space-y-4">
            <FormField label="Judul" error={errors.title} required>
              <input
                value={values.title}
                onChange={(event) => update("title", event.target.value)}
                className={inputClassName}
                placeholder="Contoh: Packing pesanan pagi..."
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Tipe">
                <select value={values.type} onChange={(event) => update("type", event.target.value)} className={inputClassName}>
                  {TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </FormField>
              <FormField label="Prioritas">
                <select value={values.priority} onChange={(event) => update("priority", event.target.value)} className={inputClassName}>
                  {PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Tanggal" error={errors.date} required>
                <input type="date" value={values.date} onChange={(event) => update("date", event.target.value)} className={inputClassName} />
              </FormField>
              <FormField label="Label">
                <input value={values.label} onChange={(event) => update("label", event.target.value)} className={inputClassName} placeholder="Produk, Operasional..." />
              </FormField>
            </div>

            <FormField
              label="Pengulangan"
              hint="Cocok untuk tagihan rutin seperti listrik, air, atau langganan tahunan."
            >
              <select value={values.recurrence} onChange={(event) => update("recurrence", event.target.value)} className={inputClassName}>
                {RECURRENCE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Penanggung Jawab">
                <input value={values.assignee} onChange={(event) => update("assignee", event.target.value)} className={inputClassName} placeholder="Nama tim / orang" />
              </FormField>
              <FormField label="Status">
                <select value={values.status} onChange={(event) => update("status", event.target.value)} className={inputClassName}>
                  {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </FormField>
            </div>

            <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-3">
              <span className="text-sm font-bold text-slate-700">Sepanjang hari</span>
              <input
                type="checkbox"
                checked={values.is_all_day}
                onChange={(event) => {
                  if (event.target.checked) {
                    update("is_all_day", true);
                    update("start_time", "");
                    update("end_time", "");
                  } else {
                    update("is_all_day", false);
                  }
                }}
                className="h-4 w-4 rounded accent-emerald-600"
              />
            </div>

            {!values.is_all_day && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Jam Mulai">
                  <input type="time" value={values.start_time} onChange={(event) => update("start_time", event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Jam Selesai">
                  <input type="time" value={values.end_time} onChange={(event) => update("end_time", event.target.value)} className={inputClassName} />
                </FormField>
              </div>
            )}

            <div>
              <span className="mb-1.5 block text-xs font-extrabold text-slate-700">Warna khusus</span>
              <div className="flex flex-wrap gap-2">
                {["", ...TYPE_OPTIONS.map((option) => option.color)].map((color) => (
                  <button
                    key={color || "default"}
                    type="button"
                    onClick={() => update("color", color)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition",
                      color ? "" : "bg-slate-100",
                      values.color === color ? "border-slate-900 ring-2 ring-slate-300" : "border-slate-200 hover:border-slate-400"
                    )}
                    style={color ? { backgroundColor: color } : undefined}
                    title={color || "Warna bawaan tipe"}
                  />
                ))}
              </div>
              <span className="mt-1 block text-xs text-slate-400">Kosongkan untuk memakai warna bawaan tipe.</span>
            </div>

            <FormField label="Deskripsi">
              <textarea
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
                className={textAreaClassName}
                placeholder="Catatan tambahan..."
              />
            </FormField>
          </div>
        </FormEditorLayout>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 lg:hidden">
          <button type="button" onClick={onClose} className="h-10 border border-slate-200 px-4 text-sm font-bold text-slate-600">
            Batal
          </button>
          {entity && onDelete ? (
            <button type="button" onClick={() => onDelete(entity)} className="h-10 bg-red-50 px-4 text-sm font-extrabold text-red-600">
              Hapus
            </button>
          ) : null}
          <button
            type="submit"
            disabled={saveDisabled}
            className={cn("h-10 px-4 text-sm font-extrabold", dirty ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400")}
          >
            {entity ? "Simpan" : "Buat Jadwal"}
          </button>
        </div>
      </form>
    </CrudDialog>
  );
}
