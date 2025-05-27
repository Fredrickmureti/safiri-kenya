
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Mail, Send, MessageSquare, Plus, Phone, User, Calendar } from 'lucide-react';

const InboxManagement = () => {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState('');

  // Fetch user messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_type', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch contact submissions
  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['contact-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Reply to message
  const replyMutation = useMutation({
    mutationFn: async ({ messageId, replyContent }: { messageId: string; replyContent: string }) => {
      // First mark original as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      // Then send reply
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_type: 'admin',
          receiver_type: 'user',
          subject: `Re: ${selectedMessage.subject}`,
          content: replyContent
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast.success('Reply sent successfully');
      setReply('');
      setIsReplying(false);
    },
    onError: (error: any) => {
      toast.error(`Error sending reply: ${error.message}`);
    },
  });

  // Update contact status
  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, status, notes }: { contactId: string; status: string; notes?: string }) => {
      const updateData: any = { status };
      if (notes) updateData.admin_notes = notes;

      const { error } = await supabase
        .from('contact_submissions')
        .update(updateData)
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      toast.success('Contact status updated');
    },
    onError: (error: any) => {
      toast.error(`Error updating contact: ${error.message}`);
    },
  });

  const handleReply = () => {
    if (!reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    replyMutation.mutate({ messageId: selectedMessage.id, replyContent: reply });
  };

  const unreadMessages = messages?.filter(m => !m.is_read).length || 0;
  const pendingContacts = contacts?.filter(c => c.status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inbox Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage user messages and contact submissions</p>
        </div>
        <div className="flex space-x-4">
          {unreadMessages > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unreadMessages} unread messages
            </Badge>
          )}
          {pendingContacts > 0 && (
            <Badge variant="secondary" className="animate-pulse">
              {pendingContacts} pending contacts
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList className="grid w-full lg:w-[400px] grid-cols-2">
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>User Messages</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Contact Forms</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1">
              <Card className="h-[600px] overflow-hidden">
                <CardHeader>
                  <CardTitle>User Messages</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] overflow-y-auto">
                    {messagesLoading ? (
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
                            } ${!message.is_read ? 'bg-blue-25 dark:bg-blue-950' : ''}`}
                            onClick={() => setSelectedMessage(message)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">User Message</span>
                              <div className="flex items-center space-x-2">
                                {!message.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(message.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <h4 className="font-medium text-sm mb-1">{message.subject}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">{message.content}</p>
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

            {/* Message Detail */}
            <div className="lg:col-span-2">
              <Card className="h-[600px]">
                {selectedMessage ? (
                  <>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{selectedMessage.subject}</span>
                        <Badge variant={selectedMessage.is_read ? 'secondary' : 'default'}>
                          {selectedMessage.is_read ? 'Read' : 'Unread'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                      </div>
                      
                      {isReplying ? (
                        <div className="space-y-4">
                          <Label htmlFor="reply">Reply</Label>
                          <Textarea
                            id="reply"
                            rows={6}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Type your reply here..."
                          />
                          <div className="flex space-x-2">
                            <Button 
                              onClick={handleReply}
                              disabled={replyMutation.isPending}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600"
                            >
                              <Send className="mr-2 h-4 w-4" />
                              {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                            </Button>
                            <Button variant="outline" onClick={() => setIsReplying(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button onClick={() => setIsReplying(true)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Reply
                        </Button>
                      )}
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Mail className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Select a message to view details</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact List */}
            <div className="lg:col-span-1">
              <Card className="h-[600px] overflow-hidden">
                <CardHeader>
                  <CardTitle>Contact Submissions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] overflow-y-auto">
                    {contactsLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : contacts && contacts.length > 0 ? (
                      <div className="space-y-1">
                        {contacts.map((contact: any) => (
                          <div
                            key={contact.id}
                            className={`p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700 border-b ${
                              selectedContact?.id === contact.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                            }`}
                            onClick={() => setSelectedContact(contact)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{contact.name}</span>
                              <Badge 
                                variant={
                                  contact.status === 'pending' ? 'destructive' :
                                  contact.status === 'responded' ? 'default' : 'secondary'
                                }
                              >
                                {contact.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{contact.email}</p>
                            <p className="text-xs text-gray-500">
                              {contact.subject || 'No subject'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No contact submissions</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Detail */}
            <div className="lg:col-span-2">
              <Card className="h-[600px]">
                {selectedContact ? (
                  <>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{selectedContact.subject || 'Contact Form Submission'}</span>
                        <Badge 
                          variant={
                            selectedContact.status === 'pending' ? 'destructive' :
                            selectedContact.status === 'responded' ? 'default' : 'secondary'
                          }
                        >
                          {selectedContact.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        From: {selectedContact.name} ({selectedContact.email})
                        <br />
                        {new Date(selectedContact.created_at).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => window.open(`tel:${selectedContact.phone || ''}`)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </Button>
                        <Button 
                          onClick={() => window.open(`mailto:${selectedContact.email}`)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </Button>
                        <Button 
                          onClick={() => updateContactMutation.mutate({ 
                            contactId: selectedContact.id, 
                            status: 'responded' 
                          })}
                          variant="outline"
                        >
                          Mark as Responded
                        </Button>
                        <Button 
                          onClick={() => updateContactMutation.mutate({ 
                            contactId: selectedContact.id, 
                            status: 'resolved' 
                          })}
                          variant="outline"
                        >
                          Mark as Resolved
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Select a contact to view details</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InboxManagement;
