'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import ThemeToggle from './ThemeToggle';
import { MoonIcon, SunIcon } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="font-bold text-white">TE</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Todo Evolution</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
            Home
          </Link>
          <Link href="/features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
            Features
          </Link>
          <Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
            Pricing
          </Link>
          <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
            About
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition shadow-md"
          >
            Sign Up
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}