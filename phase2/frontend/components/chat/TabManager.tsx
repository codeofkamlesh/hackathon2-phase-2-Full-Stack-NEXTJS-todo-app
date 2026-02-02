'use client';

import { X, Plus } from 'lucide-react';
import { ChatSession } from '@/hooks/useChatSession';

interface TabManagerProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSwitch: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
}

export default function TabManager({
  sessions,
  activeSessionId,
  onSwitch,
  onClose,
  onNew
}: TabManagerProps) {
  return (
    <div className="flex overflow-x-auto pb-2 hide-scrollbar">
      <button
        onClick={onNew}
        className="flex items-center justify-center h-10 w-10 rounded-l-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
        aria-label="New chat"
      >
        <Plus size={18} />
      </button>
      <div className="flex space-x-1">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <div
              key={session.id}
              className={`flex items-center min-w-[120px] max-w-xs px-3 py-2 rounded-t-lg text-sm font-medium cursor-pointer ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSwitch(session.id)}
            >
              <span className="truncate mr-1">{session.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(session.id);
                }}
                className="ml-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 p-0.5 flex-shrink-0"
                aria-label={`Close ${session.title}`}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}