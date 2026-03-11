'use client';
import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export default function DashboardLayout({ children, rightPanel }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden">
      {/* Sidebar — fixed */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Content + optional right panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Scrollable main content */}
          <main className="flex-1 overflow-y-auto px-6 py-6">
            {children}
          </main>

          {/* Optional right panel */}
          {rightPanel && (
            <aside className="w-80 shrink-0 overflow-y-auto border-l border-white/5 px-4 py-6 bg-[#0d1117]">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}