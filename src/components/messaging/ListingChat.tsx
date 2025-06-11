<<<<<<< HEAD
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send } from 'lucide-react';

interface ListingChatProps {
  listingId: string;
  sellerId: string;
  sellerName: string;
  listingTitle: string;
}

const ListingChat = ({ listingId, sellerId, sellerName, listingTitle }: ListingChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to message sellers.",
        variant: "destructive"
      });
      return;
    }

    if (user.id === sellerId) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot send messages to yourself.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // First, check if a conversation already exists
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${sellerId}),and(participant_1.eq.${sellerId},participant_2.eq.${user.id})`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let conversationId = existingConversation?.id;

      // If no conversation exists, create one
      if (!conversationId) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant_1: user.id,
            participant_2: sellerId,
            listing_id: listingId
          })
          .select('id')
          .single();

        if (createError) throw createError;
        conversationId = newConversation.id;
      }

      // Send the initial message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: sellerId,
          content: message.trim(),
          listing_id: listingId
        });

      if (messageError) throw messageError;

      // Navigate to the messages page with the conversation open
      navigate('/messages', { state: { conversationId } });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Want to message the seller?</h3>
            <p className="text-gray-600 mb-4">Please log in to start a conversation with {sellerName}</p>
            <Button onClick={() => navigate('/auth')}>Log In</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (user.id === sellerId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">This is your listing</h3>
            <p className="text-gray-600">You cannot message yourself</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Message Seller
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStartConversation} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Send a message to {sellerName} about "{listingTitle}"
            </p>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSending || !message.trim()}
          >
            {isSending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </div>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

=======
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send } from 'lucide-react';

interface ListingChatProps {
  listingId: string;
  sellerId: string;
  sellerName: string;
  listingTitle: string;
}

const ListingChat = ({ listingId, sellerId, sellerName, listingTitle }: ListingChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to message sellers.",
        variant: "destructive"
      });
      return;
    }

    if (user.id === sellerId) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot send messages to yourself.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // First, check if a conversation already exists
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${sellerId}),and(participant_1.eq.${sellerId},participant_2.eq.${user.id})`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let conversationId = existingConversation?.id;

      // If no conversation exists, create one
      if (!conversationId) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant_1: user.id,
            participant_2: sellerId,
            listing_id: listingId
          })
          .select('id')
          .single();

        if (createError) throw createError;
        conversationId = newConversation.id;
      }

      // Send the initial message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: sellerId,
          content: message.trim(),
          listing_id: listingId
        });

      if (messageError) throw messageError;

      // Navigate to the messages page with the conversation open
      navigate('/messages', { state: { conversationId } });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Want to message the seller?</h3>
            <p className="text-gray-600 mb-4">Please log in to start a conversation with {sellerName}</p>
            <Button onClick={() => navigate('/auth')}>Log In</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (user.id === sellerId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">This is your listing</h3>
            <p className="text-gray-600">You cannot message yourself</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Message Seller
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStartConversation} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Send a message to {sellerName} about "{listingTitle}"
            </p>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSending || !message.trim()}
          >
            {isSending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </div>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
export default ListingChat; 