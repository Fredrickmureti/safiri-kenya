
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Search, User, Circle } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_online: boolean | null;
  created_at: string;
  updated_at: string;
}

interface UserWithEmail extends UserProfile {
  email?: string;
}

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserWithEmail[]>([]);

  // Fetch all users - Simplified to only use profiles table data
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        // Fetch profiles with email data using the public.profiles view or table
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;
        
        // Use a separate query to get auth users emails
        // Note: This is a workaround until proper admin API access is set up
        const authUsers = [];  // We'll fill this with data from a different approach

        // Combine the datasets with available info
        const combinedData = profiles.map((profile: UserProfile) => {
          // Instead of trying to fetch from auth.users, we'll just use available data
          return {
            ...profile,
            email: 'user@example.com', // Placeholder - in production would be replaced with actual email
          };
        });

        return combinedData || [];
      } catch (error: any) {
        toast.error(`Error loading users: ${error.message}`);
        console.error('Error loading users:', error);
        return [];
      }
    },
  });

  // Set up real-time listener for profiles
  useEffect(() => {
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
      }, payload => {
        console.log('Profile changed:', payload);
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
    };
  }, [refetch]);

  // Filter users whenever search term or users data changes
  useEffect(() => {
    if (!users) return;

    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = users.filter((user: UserWithEmail) =>
      (user.full_name?.toLowerCase().includes(searchLower) || false) ||
      (user.email?.toLowerCase().includes(searchLower) || false) ||
      (user.phone?.toLowerCase().includes(searchLower) || false) ||
      user.id.toLowerCase().includes(searchLower)
    );

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get initials from name
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <div className="text-sm text-muted-foreground">
          Total Users: {users?.length || 0}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        {user.avatar_url ? (
                          <AvatarImage src={user.avatar_url} alt={user.full_name || 'User'} />
                        ) : (
                          <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground font-mono">{user.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p>{user.email || 'No email available'}</p>
                      <p className="text-sm text-muted-foreground">{user.phone || 'No phone'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Circle
                        className={`h-3 w-3 mr-2 ${
                          user.is_online ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300'
                        }`}
                      />
                      <span>{user.is_online ? 'Online' : 'Offline'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>{formatDate(user.updated_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
