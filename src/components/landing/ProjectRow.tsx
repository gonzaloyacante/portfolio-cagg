type ProjectRowProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

export function ProjectRow({ label, value, highlight = false }: ProjectRowProps) {
  return (
    <div className="grid grid-cols-12 gap-3">
      <dt className="text-label tracking-label text-muted-foreground/60 col-span-3 pt-0.5 font-mono uppercase">
        {label}
      </dt>
      <dd
        className={`col-span-9 leading-relaxed ${
          highlight ? 'text-foreground font-medium' : 'text-muted-foreground'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
