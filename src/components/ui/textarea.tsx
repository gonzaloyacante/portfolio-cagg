import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, onInput, ...props }: React.ComponentProps<'textarea'>) {
  // Auto-resize: keep the textarea in sync with its content. The caller can
  // still pass `rows` for an initial height, and we grow from there.
  const innerRef = React.useRef<HTMLTextAreaElement>(null);
  React.useImperativeHandle(
    React.useRef<HTMLTextAreaElement>(null),
    () => innerRef.current as HTMLTextAreaElement
  );

  const autoResize = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  return (
    <textarea
      ref={innerRef}
      data-slot="textarea"
      rows={props.rows ?? 3}
      onInput={(e) => {
        autoResize();
        onInput?.(e);
      }}
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex field-sizing-content min-h-16 w-full resize-y rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
