'use client';

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div>
      <label className="block font-medium text-ink mb-1.5" style={{ fontSize: '13px' }}>
        {label}
        {hint && <span className="font-normal text-body-light ml-2" style={{ fontSize: '12px' }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
}

export function TextInput({ value, onChange, placeholder, multiline, rows = 3, maxLength }: TextInputProps) {
  const shared = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder,
    maxLength,
    className: 'w-full px-4 py-3 rounded-button text-sm text-ink bg-white placeholder:text-body-light',
    style: { border: '1px solid #E2DBCF', outline: 'none', resize: 'vertical' as const },
  };

  return multiline ? (
    <div>
      <textarea {...shared} rows={rows} />
      {maxLength && (
        <p className="text-right text-xs text-body-light mt-1">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  ) : (
    <input type="text" {...shared} style={{ border: '1px solid #E2DBCF', outline: 'none' }} />
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: SectionProps) {
  return (
    <section className="mb-8">
      <h2 className="font-semibold text-ink mb-5 pb-3" style={{ fontSize: '14px', borderBottom: '1px solid #EAE3D8' }}>
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
