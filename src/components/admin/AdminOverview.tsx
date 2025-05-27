
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Car, MapPin, TrendingUp } from 'lucide-react';

interface BookingStat {
  status: string;
  count: number;
}

const AdminOverview = () => {
  // Get latest bookings
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data || [];
    }
  });

  // Get statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async () => {
      // Get total users
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      // Get total bookings
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
        
      // Get bookings by status
      const bookingsByStatusPromise = supabase
        .from('bookings')
        .select('status');
        
      const bookingsByStatusResult = await bookingsByStatusPromise;
      
      if (bookingsByStatusResult.error) {
        throw bookingsByStatusResult.error;
      }
      
      // Count bookings by status
      const counts: Record<string, number> = {};
      bookingsByStatusResult.data?.forEach(booking => {
        counts[booking.status] = (counts[booking.status] || 0) + 1;
      });
      
      const bookingsByStatus = Object.entries(counts).map(([status, count]) => ({
        status,
        count
      }));
      
      if (usersError || bookingsError) {
        throw usersError || bookingsError;
      }
      
      return {
        usersCount: usersCount || 0,
        bookingsCount: bookingsCount || 0,
        bookingsByStatus: bookingsByStatus || []
      };
    }
  });

  // Get online users
  const { data: onlineUsers, isLoading: onlineLoading } = useQuery({
    queryKey: ['admin-online-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_online', true);
        
      if (error) throw error;
      return data?.length || 0;
    }
  });

  // Register real-time listeners for new bookings
  useEffect(() => {
    const bookingsChannel = supabase
      .channel('admin-bookings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
      }, payload => {
        console.log('Booking changed:', payload);
        // Trigger a refetch of the bookings data
        // In a real app, you'd use queryClient.invalidateQueries
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  const isLoading = statsLoading || bookingsLoading || onlineLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : stats?.usersCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {onlineUsers} online now
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : stats?.bookingsCount}
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              <p className="text-xs text-green-500">+5.2% this week</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Available Routes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              Across 5 cities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Fleet</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Types of coaches
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="recent-bookings">
        <TabsList>
          <TabsTrigger value="recent-bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="booking-stats">Booking Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="recent-bookings" className="p-0 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <p>Loading recent bookings...</p>
              ) : recentBookings?.length === 0 ? (
                <p>No bookings found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">From</th>
                        <th className="text-left p-2">To</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings?.map((booking: any) => (
                        <tr key={booking.id} className="border-b">
                          <td className="p-2">{booking.from_location}</td>
                          <td className="p-2">{booking.to_location}</td>
                          <td className="p-2">{new Date(booking.departure_date).toLocaleDateString()}</td>
                          <td className="p-2">{booking.user_id.substring(0, 8)}...</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'upcoming' 
                                ? 'bg-blue-100 text-blue-800' 
                                : booking.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="booking-stats" className="p-0 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <p>Loading statistics...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Booking Status</h4>
                    <div className="space-y-2">
                      {stats?.bookingsByStatus.map((item: BookingStat) => (
                        <div key={item.status} className="flex items-center">
                          <div className="w-1/3">{item.status}</div>
                          <div className="w-2/3 flex items-center">
                            <div 
                              className="h-2 rounded"
                              style={{
                                width: `${(item.count / stats.bookingsCount) * 100}%`,
                                backgroundColor: 
                                  item.status === 'upcoming' ? '#3b82f6' :
                                  item.status === 'completed' ? '#10b981' : '#ef4444'
                              }}
                            />
                            <span className="ml-2 text-sm">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOverview;
