'use client';
import { ReactNode } from 'react';
import { C } from './AuthLayout';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div>
      <div className="mb-7">
        <h1 className="font-bold mb-1.5 tracking-tight"
          style={{ fontFamily:'Georgia,serif', fontSize:28, color:C.text, letterSpacing:'-0.4px' }}>{title}</h1>
        <p className="text-sm leading-relaxed" style={{ color:C.muted }}>{subtitle}</p>
      </div>
      <div className="rounded-2xl p-6"
        style={{ background:C.white, border:'1px solid #D1DCE8', boxShadow:'0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)' }}>
        {children}
      </div>
      {footer && <div className="mt-5 text-center">{footer}</div>}
    </div>
  );
}