'use client';

import { useState } from 'react';
import { Bot, X, MessageCircle } from 'lucide-react';
import { useChatSession } from '@/hooks/useChatSession';
import TabManager from './TabManager';
import ChatInterface from './ChatInterface';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    sessions,
    activeSessionId,
    createNewSession,
    removeSession,
    switchSession,
    addMessageToActive,
    activeSession
  } = useChatSession();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (message: string) => {
    // Add user message
    if (activeSessionId) {
      addMessageToActive(message, 'user');

      // Mock AI response after a short delay
      setTimeout(() => {
        if (activeSessionId) {
          const aiResponse = `This is a mock response to: "${message}"`;
          addMessageToActive(aiResponse, 'assistant');
        }
      }, 1000);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200 p-4 flex items-center justify-center w-14 h-14"
          aria-label="Open chat"
        >
          <Bot size={24} />
        </button>
      </div>

      {/* Main Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg w-96 h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] z-40 flex flex-col sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 sm:h-[600px]">
          <div className="flex flex-col h-full">
            {/* Header with TabManager */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-2">
              <TabManager
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSwitch={switchSession}
                onClose={removeSession}
                onNew={createNewSession}
              />
            </div>

            {/* Body with ChatInterface */}
            <div className="flex-grow overflow-hidden p-2">
              {activeSession ? (
                <ChatInterface
                  messages={activeSession.messages}
                  onSendMessage={handleSendMessage}
                  isLoading={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <p>No active session</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop when chat is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={toggleChat}
        ></div>
      )}
    </>
  );
}