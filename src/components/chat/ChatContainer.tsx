import React from 'react';
import ChatList from './ChatList';
import ChatFilters from './ChatFilters';
import Header from '../Header';
import { ChatPreview } from './types';

interface ChatContainerProps {
  chats: ChatPreview[];
  loading: boolean;
  error?: string;
  activeFilter: ChatFilter;
  onFilterChange: (filter: ChatFilter) => void;
  onSelectChat: (chat: ChatPreview) => void;
  onDeleteChat: (chatId: string) => void;
  onStartCall: (chatId: string) => void;
  direction?: 'left' | 'right';
}

export default function ChatContainer({
  chats,
  loading,
  error,
  activeFilter,
  onFilterChange,
  onSelectChat,
  onDeleteChat,
  onStartCall,
  direction
}: ChatContainerProps & { direction?: 'left' | 'right' }) {
  const filteredChats = chats.filter(chat => {
    switch (activeFilter) {
      case 'direct':
        return !chat.isGroup;
      case 'groups':
        return chat.isGroup;
      default:
        return true;
    }
  });

  const chatCounts = {
    all: chats.length,
    direct: chats.filter(chat => !chat.isGroup).length,
    groups: chats.filter(chat => chat.isGroup).length
  };

  return (
    <div className={`chat-page-container page-transition ${
      direction === 'right' ? 'slide-right' : 'slide-left'
    }`}>
      <header className="fixed-header theme-bg">
        <Header />
      </header>
      
      <div className="fixed-filters theme-bg-primary border-b theme-divide">
        <ChatFilters
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          counts={chatCounts}
        />
      </div>

      <main className="chat-content-area">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="loading-state">
            <span className="theme-text">Caricamento chat...</span>
          </div>
        ) : filteredChats.length > 0 ? (
          <ChatList 
            chats={filteredChats}
            onSelectChat={onSelectChat}
            onDeleteChat={onDeleteChat}
            onStartCall={onStartCall}
          />
        ) : (
          <div className="empty-state">
            <p className="empty-title">
              {activeFilter === 'groups' 
                ? 'Nessun gruppo attivo'
                : activeFilter === 'direct'
                ? 'Nessuna chat diretta'
                : 'Nessuna chat attiva'}
            </p>
            <p className="empty-subtitle">
              {activeFilter === 'groups'
                ? 'Crea un nuovo gruppo dalla sezione Gruppi'
                : 'Seleziona un contatto dalla rubrica per iniziare una nuova conversazione'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}