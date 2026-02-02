'use client';

import { forwardRef } from 'react';
import {
  List, Shield, Database, Bot, Lock, Zap, CheckCircle,
  type LucideIcon
} from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
  strokeWidth?: number;
}

const iconMap: Record<string, LucideIcon> = {
  list: List,
  shield: Shield,
  database: Database,
  bot: Bot,
  lock: Lock,
  zap: Zap,
  checkcircle: CheckCircle,
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 24, strokeWidth = 2, className, ...props }, ref) => {
    const LucideIcon = iconMap[name.toLowerCase().replace(/[^a-z0-9]/g, '')];

    if (!LucideIcon) {
      console.warn(`Icon "${name}" not found`);
      return null;
    }

    return (
      <LucideIcon
        ref={ref}
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';