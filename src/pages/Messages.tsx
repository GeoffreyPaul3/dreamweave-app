/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MessagesList from '@/components/messaging/MessagesList';
import ChatWindow from '@/components/messaging/ChatWindow';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);

  const handleSelectConversation = (conversationId: string, otherParticipant: any) => {
    setSelectedConversation(conversationId);
    setSelectedParticipant(otherParticipant);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <div className="lg:col-span-1">
            <MessagesList onSelectConversation={handleSelectConversation} />
          </div>
          
          <div className="lg:col-span-2">
            <ChatWindow 
              conversationId={selectedConversation}
              otherParticipant={selectedParticipant}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
