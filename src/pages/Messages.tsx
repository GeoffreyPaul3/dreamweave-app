/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MessagesList from '@/components/messaging/MessagesList';
import ChatWindow from '@/components/messaging/ChatWindow';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  const handleSelectConversation = (conversationId: string, otherParticipant: any) => {
    setSelectedConversation(conversationId);
    setSelectedParticipant(otherParticipant);
  };

  useEffect(() => {
    if (initialized) return;
    const params = new URLSearchParams(location.search);
    const listingId = params.get('listingId');
    if (listingId) {
      // Try to find or create a conversation for this listing
      (async () => {
        // Get current user
        const { data: { user } } = await import('@/hooks/useAuth').then(mod => mod.useAuth());
        if (!user) return;
        // Get the listing to find the seller
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: listing } = await supabase
          .from('listings')
          .select('seller_id')
          .eq('id', listingId)
          .single();
        if (!listing) return;
        const sellerId = listing.seller_id;
        if (user.id === sellerId) return;
        // Check for existing conversation
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('id')
          .or(`and(participant_1.eq.${user.id},participant_2.eq.${sellerId}),and(participant_1.eq.${sellerId},participant_2.eq.${user.id})`)
          .single();
        let conversationId = existingConversation?.id;
        if (!conversationId) {
          // Create conversation
          const { data: newConversation } = await supabase
            .from('conversations')
            .insert({ participant_1: user.id, participant_2: sellerId, listing_id: listingId })
            .select('id')
            .single();
          conversationId = newConversation?.id;
        }
        // Get seller profile
        const { data: sellerProfile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', sellerId)
          .single();
        if (conversationId && sellerProfile) {
          setSelectedConversation(conversationId);
          setSelectedParticipant(sellerProfile);
        }
        setInitialized(true);
      })();
    } else {
      setInitialized(true);
    }
  }, [location.search, initialized]);

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
