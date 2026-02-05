# UI Component Generation Skill

## Purpose
A template for creating new Next.js components that strictly follow the existing Tailwind/Dark Mode theme in the Todo app.

## Component Structure Template

### 1. Base Component Pattern
```tsx
'use client';

import { useState, useEffect } from 'react';
import { /* lucide icons as needed */ } from 'lucide-react';

interface ComponentNameProps {
  // Define all props here with proper TypeScript types
  prop1?: string;
  prop2?: boolean;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
}

export default function ComponentName({
  prop1,
  prop2 = false,
  onChange,
  children
}: ComponentNameProps) {
  // Component logic here

  return (
    <div className="/* base styles */">
      {/* Component JSX */}
    </div>
  );
}
```

### 2. Tailwind Styling Standards

#### Color Palette
- Primary: `bg-indigo-600` / `text-indigo-600` / `border-indigo-600`
- Secondary: `bg-gray-200` / `text-gray-700` / `border-gray-300`
- Dark Mode: `dark:bg-gray-800` / `dark:text-white` / `dark:border-gray-600`
- Danger/Error: `bg-red-500` / `text-red-100` / `border-red-500`
- Success: `bg-green-500` / `text-green-100` / `border-green-500`

#### Common Classes
- Shadows: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`
- Borders: `rounded-md`, `border`, `border-gray-200`
- Spacing: `p-2`, `py-3`, `px-4`, `m-1`, `space-y-2`
- Transitions: `transition-colors`, `duration-200`, `ease-in-out`

#### Responsive Design
- Mobile First: Base styles for mobile, then `md:`, `lg:` prefixes
- Flex/Grid: `flex-col`, `flex-row`, `grid-cols-1`, `md:grid-cols-2`

### 3. Dark Mode Implementation
```tsx
// Always include dark mode variants:
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"

// For interactive elements:
className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
```

### 4. Component Creation Checklist

#### Before Creating:
- [ ] Check if similar component already exists in `components/` or `app/dashboard/components/`
- [ ] Determine if component should be generic or page-specific
- [ ] Plan responsive behavior for mobile/desktop
- [ ] Consider accessibility requirements (ARIA labels, keyboard navigation)

#### Implementation:
- [ ] Use TypeScript interfaces for props
- [ ] Implement proper loading states if needed
- [ ] Include error handling if applicable
- [ ] Add proper key prop for lists
- [ ] Ensure semantic HTML elements
- [ ] Test dark/light mode switching
- [ ] Verify responsive design on multiple screen sizes

#### Styling:
- [ ] Apply consistent spacing (padding/margin classes)
- [ ] Use theme colors consistently
- [ ] Implement hover/focus states for interactive elements
- [ ] Include proper focus rings for accessibility
- [ ] Ensure contrast ratios meet WCAG guidelines

### 5. Common Component Templates

#### Button Component
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none";

  const variantClasses = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800"
  };

  const sizeClasses = {
    sm: "h-8 px-2 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
```

#### Form Input Component
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
          error
            ? 'border-red-500 dark:border-red-500'
            : 'border-gray-300 dark:border-gray-600'
        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
          className
        }`}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
}
```

### 6. Dark Mode Best Practices
- Always test components in both light and dark mode
- Use Tailwind's dark: variant for all color-related classes
- Ensure sufficient contrast in both modes
- Test transitions between themes
- Consider different text treatments (weights, opacity) for readability

### 7. Testing Components
- [ ] Visual regression in light/dark mode
- [ ] Responsiveness across breakpoints
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Edge cases (empty states, loading states)