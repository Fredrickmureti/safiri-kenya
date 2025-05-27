
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Mail, Send, MessageSquare, Plus, Eye, EyeOff } from 'lucide-react';

const InboxPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: ''
  });

  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_type.eq.user`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          sender_type: 'user',
          receiver_type: 'admin',
          subject: messageData.subject,
          content: messageData.content
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message sent successfully');
      setNewMessage({ subject: '', content: '' });
      setIsComposing(false);
    },
    onError: (error: any) => {
      toast.error(`Error sending message: ${error.message}`);
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.subject || !newMessage.content) {
      toast.error('Please fill in all fields');
      return;
    }
    sendMessageMutation.mutate(newMessage);
  };

  const handleSelectMessage = (message: any) => {
    setSelectedMessage(message);
    if (!message.is_read && message.sender_type === 'admin') {
      markAsReadMutation.mutate(message.id);
    }
  };

  const unreadCount = messages?.filter(m => !m.is_read && m.sender_type === 'admin').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
              <p className="text-gray-600 dark:text-gray-400">Communicate with our support team</p>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {unreadCount} unread
                </Badge>
              )}
              <Button 
                onClick={() => setIsComposing(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1">
              <Card className="h-[600px] overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Inbox
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <div className="space-y-1">
                        {messages.map((message: any) => (
                          <div
                            key={message.id}
                            className={`p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700 border-b ${
                              selectedMessage?.id === message.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                            } ${!message.is_read && message.sender_type === 'admin' ? 'bg-blue-25 dark:bg-blue-950' : ''}`}
                            onClick={() => handleSelectMessage(message)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm text-gray-900 dark:text-white">
                                {message.sender_type === 'admin' ? 'Support Team' : 'You'}
                              </span>
                              <div className="flex items-center space-x-2">
                                {!message.is_read && message.sender_type === 'admin' && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(message.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1">
                              {message.subject}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {message.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No messages yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Detail or Compose */}
            <div className="lg:col-span-2">
              <Card className="h-[600px]">
                {isComposing ? (
                  <>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>New Message</span>
                        <Button variant="ghost" onClick={() => setIsComposing(false)}>
                          Cancel
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={newMessage.subject}
                          onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Enter message subject"
                        />
                      </div>
                      <div>
                        <Label htmlFor="content">Message</Label>
                        <Textarea
                          id="content"
                          rows={12}
                          value={newMessage.content}
                          onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Type your message here..."
                        />
                      </div>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                      </Button>
                    </CardContent>
                  </>
                ) : selectedMessage ? (
                  <>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{selectedMessage.subject}</span>
                        <Badge variant={selectedMessage.sender_type === 'admin' ? 'default' : 'secondary'}>
                          {selectedMessage.sender_type === 'admin' ? 'Support Team' : 'You'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                          {selectedMessage.content}
                        </p>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Mail className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Select a message to read or compose a new one</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
