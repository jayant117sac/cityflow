'use client';
import { useState, ReactNode } from 'react';
import { C } from './AuthLayout';

interface AuthInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  rightElement?: ReactNode;
  onRightClick?: () => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export default function AuthInput({
  label,
  type = 'text',
  value,
  onChange,
  icon,
  rightElement,
  onRightClick,
  error,
  hint,
  autoComplete,
  required,
  disabled,
  name,
  id,
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  // Float the label whenever the input is focused OR has a value
  const active = focused || value.length > 0;

  const borderColor = error ? C.error : focused ? C.primary : '#CBD5E1';
  const shadow      = error
    ? `0 0 0 3px ${C.error}18`
    : focused
    ? `0 0 0 3px ${C.primary}22`
    : 'none';

  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* ── wrapper: fixed height so label has room to float ── */}
      <div style={{ position: 'relative', height: 58 }}>

        {/* Left icon — vertically centred in the 58px box */}
        {icon && (
          <div style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center',
            color: focused ? C.primary : '#94A3B8',
            transition: 'color 0.2s',
            pointerEvents: 'none', zIndex: 2,
          }}>
            {icon}
          </div>
        )}

        {/* Floating label */}
        <label
          htmlFor={inputId}
          style={{
            position: 'absolute',
            left: icon ? 44 : 14,
            // When active: sit near the top of the 58px box
            // When inactive: vertically centre in the box
            top: active ? 8 : '50%',
            transform: active ? 'translateY(0)' : 'translateY(-50%)',
            fontSize: active ? 10 : 14,
            fontWeight: active ? 700 : 400,
            letterSpacing: active ? '0.5px' : '0',
            textTransform: active ? 'uppercase' : 'none',
            color: error ? C.error : focused ? C.primary : '#94A3B8',
            transition: 'top 0.18s ease, transform 0.18s ease, font-size 0.18s ease, color 0.18s ease',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
          {required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
        </label>

        {/* Input — fills the 58px container */}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          // Never show a native placeholder — the floating label IS the placeholder
          placeholder=""
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            // When active: push text to the bottom half so label has room above
            paddingTop: active ? 22 : 0,
            paddingBottom: active ? 6 : 0,
            paddingLeft: icon ? 44 : 14,
            paddingRight: rightElement ? 44 : 14,
            fontSize: 14,
            fontWeight: 500,
            color: C.text,
            background: focused ? '#FFFFFF' : '#F1F5F9',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 10,
            boxShadow: shadow,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />

        {/* Right element — e.g. show/hide password */}
        {rightElement && (
          <button
            type="button"
            onClick={onRightClick}
            tabIndex={-1}
            aria-label="Toggle visibility"
            style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 4, background: 'none', border: 'none',
              cursor: 'pointer', color: '#94A3B8',
              transition: 'color 0.2s', zIndex: 2,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = C.primary)}
            onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
          >
            {rightElement}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p id={`${inputId}-error`} role="alert"
          style={{ display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 500, color: C.error, marginLeft: 2 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </p>
      )}

      {/* Hint */}
      {hint && !error && (
        <p id={`${inputId}-hint`}
          style={{ fontSize: 11, color: C.muted, marginLeft: 2 }}>
          {hint}
        </p>
      )}
    </div>
  );
}