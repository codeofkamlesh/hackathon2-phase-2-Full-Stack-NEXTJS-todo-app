import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define TypeScript types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export interface UseChatSessionReturn {
  sessions: ChatSession[];
  activeSessionId: string | null;
  createNewSession: () => void;
  removeSession: (sessionId: string) => void;
  switchSession: (sessionId: string) => void;
  addMessageToActive: (content: string, role: 'user' | 'assistant') => void;
  activeSession: ChatSession | undefined;
}

export const useChatSession = (): UseChatSessionReturn => {
  // Initialize with one empty session by default
  const initialSession: ChatSession = {
    id: uuidv4(),
    title: 'New Chat',
    messages: [],
  };

  const [sessions, setSessions] = useState<ChatSession[]>([initialSession]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSession.id);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
    };

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  };

  const removeSession = (sessionId: string) => {
    setSessions(prev => {
      const updatedSessions = prev.filter(session => session.id !== sessionId);

      // If the active session is being deleted, handle the switch
      if (activeSessionId === sessionId) {
        if (updatedSessions.length === 0) {
          // If no sessions remain, create a new one
          const newSession: ChatSession = {
            id: uuidv4(),
            title: 'New Chat',
            messages: [],
          };
          setActiveSessionId(newSession.id);
          return [newSession];
        } else {
          // Otherwise, switch to the previous available session
          const availableSession = updatedSessions[updatedSessions.length - 1];
          setActiveSessionId(availableSession.id);
        }
      }

      return updatedSessions;
    });
  };

  const switchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const addMessageToActive = (content: string, role: 'user' | 'assistant') => {
    if (!activeSessionId) return;

    setSessions(prev =>
      prev.map(session => {
        if (session.id === activeSessionId) {
          const newMessage: Message = {
            id: uuidv4(),
            role,
            content,
            createdAt: new Date(),
          };

          return {
            ...session,
            messages: [...session.messages, newMessage],
          };
        }
        return session;
      })
    );
  };

  // Helper to get the active session
  const activeSession = sessions.find(session => session.id === activeSessionId);

  return {
    sessions,
    activeSessionId,
    createNewSession,
    removeSession,
    switchSession,
    addMessageToActive,
    activeSession,
  };
};