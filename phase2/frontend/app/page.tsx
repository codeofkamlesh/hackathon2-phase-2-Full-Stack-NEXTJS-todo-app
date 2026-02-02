'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Navbar from '../components/ui/Navbar'; // Ensure path is correct
import Hero from '../components/landing/Hero'; // Ensure path is correct
import FeatureCards from '../components/landing/FeatureCards'; // Ensure path is correct

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent Hydration Mismatch: Render a placeholder with same background
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-950" />
    );
  }

  return (
    // ✅ Main Wrapper: Handles Gradient & Text Colors properly
    <div className="min-h-screen transition-colors duration-300
                    bg-gradient-to-br from-blue-50 to-purple-50
                    dark:from-gray-900 dark:to-gray-950
                    text-gray-900 dark:text-white">

      <Navbar />

      <main>
        <Hero />
        <FeatureCards />
      </main>

      <footer className="py-6 text-center text-gray-600 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-800 mt-10">
        <p>© {new Date().getFullYear()} Todo Evolution - Mastering Spec-Driven Development & Cloud Native AI</p>
      </footer>
    </div>
  );
}