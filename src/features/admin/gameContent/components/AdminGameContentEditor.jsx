import { useEffect, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { required, validateFields } from "@/core/utils/formValidation";
import {
  GAME_TYPES,
  GAME_TYPE_META,
  emptyPayloadForType,
  getAdminGameContentError,
  payloadTypeHint,
  useCreateAdminGameContent,
  useUpdateAdminGameContent,
} from "@/features/admin/gameContent/services/adminGameContentService";

function initialValues(entity) {
  return {
    gameType: entity?.gameType || GAME_TYPES[0],
    title: entity?.title || "",
    difficulty: entity?.difficulty || "",
    isActive: entity?.isActive ?? true,
    payload: entity?.payload ?? emptyPayloadForType(entity?.gameType || GAME_TYPES[0]),
  };
}

function isPlainJsonString(value) {
  // Batasi editor JSON hanya untuk jenis yang datanya berbentuk objek/row sederhana.
  return value === "quiz" ? false : true;
}

export function AdminGameContentEditor({ open, entity, onClose, onSaved }) {
  const [values, setValues] = useState(() => initialValues(entity));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const createMutation = useCreateAdminGameContent();
  const updateMutation = useUpdateAdminGameContent();
  const mutation = entity ? updateMutation : createMutation;

  const useJsonEditor = isPlainJsonString(values.gameType);
  const hint = payloadTypeHint(values.gameType);

  useEffect(() => {
    if (open) {
      setValues(initialValues(entity));
      setErrors({});
      setMessage("");
    }
  }, [entity, open]);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    if (open) {
      setJsonText(
        Array.isArray(values.payload) || typeof values.payload === "object"
          ? JSON.stringify(values.payload, null, 2)
          : String(values.payload || ""),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updatePayloadFromJson = (text) => {
    setJsonText(text);
    setErrors((current) => ({ ...current, payload: "" }));
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) || (typeof parsed === "object" && parsed !== null)) {
        setField("payload", parsed);
      } else {
        setErrors((current) => ({ ...current, payload: "Payload harus berupa array atau objek JSON." }));
      }
    } catch (error) {
      setErrors((current) => ({ ...current, payload: error.message }));
    }
  };

  // ── Quiz structured editor ────────────────────────────────────────────────

  const updateQuestion = (index, patch) => {
    setValues((current) => {
      const questions = (current.payload || []).map((item, i) => (i === index ? { ...item, ...patch } : item));
      return { ...current, payload: questions };
    });
  };

  const setQuizOption = (qIndex, oIndex, value) => {
    setValues((current) => {
      const questions = (current.payload || []).map((item, i) => (i === qIndex ? { ...item, options: item.options.map((opt, j) => (j === oIndex ? value : opt)) } : item));
      return { ...current, payload: questions };
    });
  };

  const addQuestion = () => {
    setValues((current) => ({
      ...current,
      payload: [...(current.payload || []), { question: "", options: ["", "", "", ""], correct_answer: "", difficulty: "", explanation: "" }],
    }));
  };

  const removeQuestion = (index) => {
    setValues((current) => ({ ...current, payload: (current.payload || []).filter((_, i) => i !== index) }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields(values, {
      title: required("Judul konten"),
    });
    if (!values.gameType) nextErrors.gameType = "Pilih jenis permainan.";
    if (useJsonEditor && !errors.payload && (values.payload === undefined || values.payload === null)) {
      nextErrors.payload = "Payload harus berupa array atau objek JSON.";
    }
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    try {
      const saved = entity ? await updateMutation.mutateAsync({ id: entity.id, values }) : await createMutation.mutateAsync(values);
      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getAdminGameContentError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title={entity ? "Edit Konten Game" : "Tambah Konten Game"} subtitle={hint} size="max-w-6xl" presentation="modal">
      <form onSubmit={submit}>
        <div className="grid gap-4 p-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <FormField label="Jenis Game" error={errors.gameType} required>
            <select
              value={values.gameType}
              disabled={Boolean(entity)}
              onChange={(event) => {
                const nextType = event.target.value;
                if (entity) {
                  setField("gameType", nextType);
                } else {
                  const template = emptyPayloadForType(nextType);
                  setValues((current) => ({ ...current, gameType: nextType, payload: template }));
                  setJsonText(JSON.stringify(template, null, 2));
                }
              }}
              className={inputClassName}
            >
              {GAME_TYPES.map((type) => (
                <option key={type} value={type}>
                  {GAME_TYPE_META[type].label}
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Judul Konten" error={errors.title} required>
              <input value={values.title} onChange={(event) => setField("title", event.target.value)} placeholder="Contoh: Kuis Ekonomi SDG" className={inputClassName} />
            </FormField>
            <FormField label="Tingkat Kesulitan" hint="Opsional. Contoh: Mudah / Sedang / Sulit">
              <input value={values.difficulty} onChange={(event) => setField("difficulty", event.target.value)} placeholder="Mudah" className={inputClassName} />
            </FormField>
          </div>

          <div className="md:col-span-2">
            {values.gameType === "quiz" ? (
              <QuizPayloadEditor
                questions={values.payload || []}
                onUpdate={updateQuestion}
                onOptionChange={setQuizOption}
                onAdd={addQuestion}
                onRemove={removeQuestion}
              />
            ) : (
              <FormField label="Data (JSON)" hint={`${hint} Setiap baris dihitung sebagai 1 item konten.`} error={errors.payload} className="md:col-span-2">
                <textarea value={jsonText} onChange={(event) => updatePayloadFromJson(event.target.value)} rows={12} spellCheck={false} className="min-h-56 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs leading-5 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
                <span className="mt-1 block text-xs text-slate-400">
                  Item aktif: {Array.isArray(values.payload) ? values.payload.length : typeof values.payload === "object" ? Object.keys(values.payload || {}).length : 0}
                </span>
              </FormField>
            )}
          </div>

          <div className="md:col-span-2">
            <ActiveToggle checked={values.isActive} onChange={(isActive) => setField("isActive", isActive)} />
          </div>

          {message ? <p className="md:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 select-none border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:border-slate-300">
            Batal
          </button>
          <button type="submit" disabled={mutation.isPending} className="h-10 select-none bg-teal-600 px-5 text-sm font-extrabold text-white hover:bg-teal-700 disabled:opacity-60">
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </CrudDialog>
  );
}

function QuizPayloadEditor({ questions = [], onUpdate, onOptionChange, onAdd, onRemove }) {
  const optionLetters = ["A", "B", "C", "D"];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold text-slate-700">Soal & Jawaban</p>
        <button type="button" onClick={onAdd} className="inline-flex h-9 items-center gap-1.5 bg-emerald-600 px-3 text-xs font-extrabold text-white hover:bg-emerald-700">
          <span className="material-symbols-outlined text-[17px]">add</span>
          Tambah Soal
        </button>
      </div>
      {!questions.length ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">Belum ada soal. Klik "Tambah Soal".</p>
      ) : null}
      {questions.map((question, qIndex) => (
        <div key={qIndex} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500">Soal #{qIndex + 1}</span>
            <button type="button" onClick={() => onRemove(qIndex)} className="flex h-8 w-8 items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Hapus soal">
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
          <FormField label="Pertanyaan" required>
            <textarea value={question.question || ""} onChange={(event) => onUpdate(qIndex, { question: event.target.value })} rows={2} className="min-h-14 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {optionLetters.map((letter, oIndex) => (
              <FormField key={letter} label={`Opsi ${letter}`} required>
                <input value={question.options?.[oIndex] || ""} onChange={(event) => onOptionChange(qIndex, oIndex, event.target.value)} className={inputClassName} />
              </FormField>
            ))}
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <FormField label="Jawaban Benar" required>
              <select value={question.correct_answer || ""} onChange={(event) => onUpdate(qIndex, { correct_answer: event.target.value })} className={inputClassName}>
                <option value="">Pilih jawaban benar</option>
                {optionLetters.map((letter, oIndex) => (
                  <option key={letter} value={letter}>
                    {letter} {question.options?.[oIndex] ? `— ${question.options[oIndex]}` : ""}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Tingkat Soal" hint="Contoh: Mudah / Sedang / Sulit">
              <input value={question.difficulty || ""} onChange={(event) => onUpdate(qIndex, { difficulty: event.target.value })} className={inputClassName} />
            </FormField>
          </div>
          <FormField label="Penjelasan" hint="Opsional. Ditampilkan setelah menjawab.">
            <input value={question.explanation || ""} onChange={(event) => onUpdate(qIndex, { explanation: event.target.value })} className={inputClassName} />
          </FormField>
        </div>
      ))}
    </div>
  );
}