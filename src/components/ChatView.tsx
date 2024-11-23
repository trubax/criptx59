import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical, Phone, Video, Loader2, Paperclip, Mic, Pause, Play, Square, X } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';
import ChatOptions from './chat/ChatOptions';
import MediaInput from './chat/MediaInput';
import MessageItem from './chat/MessageItem';
import { useChat } from '../hooks/useChat';
import { CallService } from '../services/CallService';
import { useAuth } from '../contexts/AuthContext';
import AudioRecorder from './chat/AudioRecorder';
import { MediaHandlerService } from '../services/MediaHandlerService';
import AudioRecordingDialog from './chat/media/AudioRecordingDialog';
import { formatDuration } from '../../../utils/timeUtils';
import MediaDialog from './chat/media/MediaDialog';

interface ChatViewProps {
  chat: {
    id: string;
    name: string;
    photoURL: string;
    status?: string;
    lastSeen?: Date | string;
    isGroup?: boolean;
    participants?: string[];
  };
  onClose: () => void;
}

export default function ChatView({ chat, onClose }: ChatViewProps) {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const callService = new CallService();
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [shouldAutoExpand, setShouldAutoExpand] = useState(false);
  const chatMediaService = MediaHandlerService.getInstance();
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);

  const {
    messages,
    chatData,
    options,
    loading,
    error,
    sendMessage,
    deleteMessage,
    markAsRead,
    setMessageTimer
  } = useChat(chat.id);

  useEffect(() => {
    scrollToBottom();
    markAsRead();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || options.isBlocked || isUploading || isRecording) return;
    
    try {
      setSendError(null);
      const tempId = Date.now().toString();
      
      // Aggiungi un messaggio temporaneo con stato 'sending'
      const tempMessage = {
        id: tempId,
        text: message.trim(),
        timestamp: new Date(),
        isMe: true,
        status: 'sending' as const,
        senderPhoto: currentUser?.photoURL || '',
        senderName: currentUser?.displayName || ''
      };

      // Invia il messaggio
      await sendMessage(message.trim());
      setMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      setSendError(err.message || 'Errore nell\'invio del messaggio');
    }
  };

  const handleMediaSend = async (file: File) => {
    if (!currentUser || !chatData) return;
    
    try {
      setIsUploading(true);
      setSendError(null);
      const messageType = file.type.startsWith('image/') ? 'image' : 
                         file.type.startsWith('video/') ? 'video' : 'file';
      const url = await chatMediaService.processAndUploadMedia(file, {
        chatId: chat.id,
        userId: currentUser.uid,
        isGroup: chatData.type === 'group',
        isAnonymous: currentUser.isAnonymous,
        messageType
      });
      await sendMessage('', { type: messageType, url });
    } catch (err: any) {
      console.error('Error sending media:', err);
      setSendError(err.message || 'Errore nell\'invio del file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAudioSend = async (audioUrl: string) => {
    if (!currentUser || !chatData) return;
    
    try {
      setSendError(null);
      await sendMessage('', { type: 'audio', url: audioUrl });
    } catch (err: any) {
      console.error('Error sending audio:', err);
      setSendError(err.message || 'Errore nell\'invio del messaggio vocale');
    }
  };

  const handleStartCall = async (isVideo: boolean) => {
    if (!chatData) return;
    
    try {
      setIsCallActive(true);
      await callService.startCall(chat.id, isVideo);
    } catch (error: any) {
      console.error('Error starting call:', error);
      alert('Errore nell\'avvio della chiamata. Riprova.');
    }
  };

  const handleEndCall = async () => {
    try {
      await callService.endCall();
      setIsCallActive(false);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const getStatusText = () => {
    if (!chatData) return '';
    if (options.isBlocked) return 'Bloccato';
    if (chatData.type === 'group') return `${chatData.participants.length} partecipanti`;
    return chat.status === 'online' ? 'Online' : chat.lastSeen ? `Ultimo accesso ${formatLastSeen(chat.lastSeen)}` : 'Offline';
  };

  const formatLastSeen = (lastSeen?: Date | string) => {
    if (!lastSeen) return '';
    if (typeof lastSeen === 'string') return lastSeen;
    return format(lastSeen, 'dd/MM/yyyy HH:mm', { locale: it });
  };

  // Aggiungi un effetto per marcare i messaggi come letti
  useEffect(() => {
    if (!messages.length || !currentUser) return;

    const unreadMessages = messages.filter(
      msg => !msg.isMe && !msg.readBy?.includes(currentUser.uid)
    );

    if (unreadMessages.length > 0) {
      markAsRead();
    }
  }, [messages, currentUser]);

  // Gestisce l'espansione automatica in base alla larghezza della finestra
  useEffect(() => {
    const handleResize = () => {
      // Larghezza minima necessaria per tutti gli elementi (personalizza questi valori)
      const minWidth = 320; // larghezza minima base
      const extraSpace = 50; // spazio extra richiesto
      const currentWidth = window.innerWidth;

      // Espandi automaticamente se c'è abbastanza spazio
      if (currentWidth >= minWidth + extraSpace) {
        setIsMenuExpanded(true);
        setShouldAutoExpand(true);
      } else {
        setShouldAutoExpand(false);
        // Chiudi il menu solo se era stato espanso automaticamente
        if (shouldAutoExpand) {
          setIsMenuExpanded(false);
        }
      }
    };

    // Controlla al mount e quando la finestra viene ridimensionata
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shouldAutoExpand]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setSendError('File troppo grande. Massimo 100MB.');
      return;
    }

    await handleMediaSend(file);
  };

  const handleAudioComplete = async (file: File) => {
    try {
      setIsUploading(true);
      setSendError(null);
      const url = await chatMediaService.processAndUploadMedia(file, {
        chatId: chat.id,
        userId: currentUser.uid,
        isGroup: chatData.type === 'group',
        isAnonymous: currentUser.isAnonymous,
        messageType: 'audio'
      });
      await sendMessage('', { type: 'audio', url });
      setShowAudioRecorder(false);
    } catch (err: any) {
      console.error('Error sending audio:', err);
      setSendError(err.message || 'Errore nell\'invio del messaggio vocale');
    } finally {
      setIsUploading(false);
    }
  };

  const AudioRecordButton = () => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setShowMediaDialog(true)}
          disabled={isUploading || options.isBlocked}
          className="w-10 h-10 flex items-center justify-center hover:theme-bg-secondary theme-text hover:theme-text rounded-full transition-colors disabled:opacity-50"
          title="Allega file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            setShowAudioRecorder(true);
            const dialog = document.createElement('div');
            document.body.appendChild(dialog);
            const root = createRoot(dialog);
            root.render(
              <AudioRecordingDialog 
                onClose={() => {
                  root.unmount();
                  document.body.removeChild(dialog);
                  setShowAudioRecorder(false);
                }}
                onSend={handleAudioComplete}
                autoStart={true}
              />
            );
          }}
          disabled={isUploading || options.isBlocked}
          className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
          title="Registra messaggio vocale"
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 theme-bg flex items-center justify-center">
        <div className="theme-text">Caricamento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 theme-bg flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 theme-bg flex flex-col z-50">
      {/* Header */}
      <div className="theme-bg-primary p-4 flex items-center space-x-4 shadow-md">
        <button
          onClick={onClose}
          className="p-2 hover:theme-bg-secondary rounded-full transition-colors theme-text"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img
          src={chat.photoURL}
          alt={chat.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <h2 className="font-semibold theme-text">
            {chat.name}
          </h2>
          <p className="text-sm theme-text opacity-70">
            {getStatusText()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!chatData?.type && (
            <>
              <button
                onClick={() => handleStartCall(false)}
                disabled={isCallActive || options.isBlocked || chat.status !== 'online'}
                className={`p-2 rounded-full transition-colors hover:theme-bg-secondary
                ${isCallActive ? 'text-red-500' : 'text-green-500'} 
                disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleStartCall(true)}
                disabled={isCallActive || options.isBlocked || chat.status !== 'online'}
                className={`p-2 rounded-full transition-colors hover:theme-bg-secondary
                ${isCallActive ? 'text-red-500' : 'text-blue-500'}
                disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Video className="w-5 h-5" />
              </button>
            </>
          )}
          <button 
            onClick={() => setShowOptions(true)}
            className="p-2 hover:theme-bg-secondary rounded-full transition-colors theme-text"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[120px] sm:pb-[100px]">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            {...msg}
            senderPhoto={msg.isMe ? currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || '')}&background=random` : chat.photoURL}
            senderName={msg.isMe ? currentUser?.displayName || '' : chat.name}
            onDelete={deleteMessage}
            isGroupChat={chatData?.type === 'group'}
            isAdmin={chatData?.groupAdmins?.includes(currentUser?.uid)}
            isGroupCreator={chatData?.groupCreator === currentUser?.uid}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area con menu auto-espandibile */}
      <div className="absolute bottom-[53px] left-0 right-0 theme-bg-primary border-t theme-divide">
        <form onSubmit={handleSend} className="p-1.5 sm:p-2 -translate-y-[5px]">
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
            {/* Menu toggle visibile solo quando l'auto-espansione non è attiva */}
            <div className="flex items-center gap-0.5">
              {!shouldAutoExpand && (
                <button
                  type="button"
                  className={`p-1.5 sm:p-2 rounded-full hover:theme-bg-secondary theme-text flex-shrink-0 transition-transform ${
                    isMenuExpanded ? 'rotate-90' : ''
                  }`}
                  onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                >
                  <MoreVertical className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
              )}

              {/* Icone con transizione */}
              <div className={`flex items-center gap-0.5 overflow-hidden transition-all duration-200 ${
                isMenuExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
              }`}>
                {!isRecording && !message.trim() && (
                  <div className="flex-shrink-0">
                    <AudioRecordButton />
                  </div>
                )}
              </div>
            </div>

            {/* Input text adattivo */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={options.isBlocked ? 'Chat bloccata' : 'Scrivi...'}
              disabled={options.isBlocked || isUploading || isRecording}
              className={`flex-1 theme-bg-secondary theme-text rounded-full 
                px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm
                focus:outline-none focus:ring-2 focus:ring-accent 
                disabled:opacity-50 transition-all duration-200
                ${isMenuExpanded ? 'min-w-[60px] sm:min-w-[80px]' : 'min-w-[120px] sm:min-w-[150px]'}`}
            />

            {/* Pulsante invio */}
            <button
              type="submit"
              disabled={!message.trim() || options.isBlocked || isUploading || isRecording}
              className="flex-none w-8 h-8 sm:w-10 sm:h-10
                flex items-center justify-center
                theme-bg-accent rounded-full 
                hover:opacity-90 transition-colors 
                disabled:opacity-50 disabled:cursor-not-allowed theme-text"
            >
              {isUploading ? (
                <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 sm:w-5 h-4 sm:h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Chat Options */}
      <ChatOptions
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        chatData={chatData}
        options={options}
      />

      {/* Active Call Overlay */}
      {isCallActive && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
          <img
            src={chat.photoURL}
            alt={chat.name}
            className="w-24 h-24 rounded-full mb-4"
          />
          <h3 className="theme-text text-xl font-semibold mb-2">{chat.name}</h3>
          <p className="theme-text opacity-70 mb-8">Chiamata in corso...</p>
          <button
            onClick={handleEndCall}
            className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
          >
            <Phone className="w-6 h-6 theme-text" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 p-4">
        <AudioRecordButton />
      </div>

      {showAudioRecorder && (
        <AudioRecordingDialog
          onClose={() => setShowAudioRecorder(false)}
          onSend={handleAudioComplete}
        />
      )}

      {showMediaDialog && (
        <MediaDialog
          onClose={() => setShowMediaDialog(false)}
          onFileSelect={handleMediaSend}
        />
      )}
    </div>
  );
}