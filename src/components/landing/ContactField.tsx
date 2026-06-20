type ContactFieldProps = {
  id: string;
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  testId?: string;
  error?: string;
  registration: React.InputHTMLAttributes<HTMLInputElement>;
};

export function ContactField({
  id,
  label,
  type = 'text',
  required,
  autoComplete,
  maxLength,
  testId,
  error,
  registration,
}: ContactFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-muted-foreground/60 text-label tracking-label mb-2 block font-mono uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        data-testid={testId}
        aria-invalid={!!error}
        className="border-border focus:border-foreground text-foreground placeholder:text-muted-foreground/40 w-full border-0 border-b bg-transparent py-2 text-base transition-colors outline-none"
        {...registration}
      />
      {error && (
        <p role="alert" className="text-destructive mt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
