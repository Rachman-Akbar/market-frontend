import { useMemo } from "react";

function pad(value) {
  return String(value).padStart(2, "0");
}

function parseTime(value) {
  const match = String(value || "").match(/^(\d{2}):(\d{2})/);

  if (!match) {
    return { hour: null, minute: null };
  }

  return {
    hour: Math.min(23, Math.max(0, Number(match[1]))),
    minute: Math.min(59, Math.max(0, Number(match[2]))),
  };
}

const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function SpinnerColumn({ label, options, value, onChange, disabled }) {
  const index = options.indexOf(value);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="flex flex-col items-center gap-1">
        <StepButton
          disabled={disabled || index >= options.length - 1}
          onClick={() => onChange(options[index + 1])}
          label={`Naikkan ${label.toLowerCase()}`}
        >
          ▲
        </StepButton>
        <div className="min-w-[3.5rem] rounded-xl bg-emerald-50 px-3 py-2 text-center font-mono text-2xl font-bold text-emerald-700">
          {pad(value)}
        </div>
        <StepButton
          disabled={disabled || index <= 0}
          onClick={() => onChange(options[index - 1])}
          label={`Turunkan ${label.toLowerCase()}`}
        >
          ▼
        </StepButton>
      </div>
      <div className="flex max-h-20 flex-wrap justify-center gap-1 overflow-y-auto px-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            className={`h-7 min-w-7 rounded-lg px-1 text-xs font-bold transition ${
              option === value
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-emerald-100"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {pad(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepButton({ disabled, onClick, label, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-full items-center justify-center rounded-lg text-xs text-slate-400 transition hover:bg-slate-100 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function TimePicker({ value, onChange, disabled }) {
  const { hour, minute } = useMemo(() => parseTime(value), [value]);

  const setHour = (nextHour) => {
    if (nextHour === null || hour === null) {
      return;
    }

    onChange(`${pad(nextHour)}:${pad(minute)}`);
  };

  const setMinute = (nextMinute) => {
    if (nextMinute === null || hour === null) {
      return;
    }

    onChange(`${pad(hour)}:${pad(nextMinute)}`);
  };

  const hourOptions = Array.from({ length: 24 }, (_, index) => index);

  return (
    <div className="flex items-start justify-center gap-6 rounded-2xl border border-slate-200 bg-white p-4">
      <SpinnerColumn
        label="Jam"
        options={hourOptions}
        value={hour ?? 0}
        onChange={setHour}
        disabled={disabled}
      />
      <span className="mt-8 text-2xl font-bold text-slate-300">:</span>
      <SpinnerColumn
        label="Menit"
        options={MINUTE_OPTIONS}
        value={minute ?? 0}
        onChange={setMinute}
        disabled={disabled}
      />
    </div>
  );
}
