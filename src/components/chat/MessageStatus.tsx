import React from 'react';
import { Check } from 'lucide-react';

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read';
  isGroupChat: boolean;
  participants: string[];
  readBy: string[];
  senderId: string;
}

export default function MessageStatus({ 
  status, 
  isGroupChat,
  participants,
  readBy,
  senderId
}: MessageStatusProps) {
  if (isGroupChat) {
    const readByCount = readBy?.length || 0;
    const expectedReaders = participants.length - 1; // escludi il mittente
    const allRead = readByCount >= expectedReaders;

    return (
      <div className="message-status">
        <div className={`tick-container ${allRead ? 'tick-read' : ''}`}>
          <Check className="tick-single" size={16} />
        </div>
      </div>
    );
  }

  return (
    <div className="message-status">
      <div className={`tick-container ${status === 'read' ? 'tick-read' : ''}`}>
        {status === 'sent' ? (
          <Check className="tick-single" size={16} />
        ) : (
          <>
            <Check className="tick-double" size={16} />
            <Check className="tick-double" size={16} />
          </>
        )}
      </div>
    </div>
  );
} 