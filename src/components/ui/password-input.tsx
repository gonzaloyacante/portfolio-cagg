'use client';

import { forwardRef, useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Input } from './input';

type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  className?: string;
};

/**
 * <input type="password"> with a built-in eye / eye-off toggle so admins
 * can verify long passphrases on mobile without mistyping.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, disabled, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          disabled={disabled}
          className={cn('pr-10', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center justify-center px-2.5 disabled:pointer-events-none disabled:opacity-50"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
        </button>
      </div>
    );
  }
);
