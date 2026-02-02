'use client';

import { ThemeProvider } from 'next-themes';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ✅ attribute="class" lagana sabse zaroori hai
    // Iske baghair Tailwind ka dark: prefix kaam nahi karega
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}