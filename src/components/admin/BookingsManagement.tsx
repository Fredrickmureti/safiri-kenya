
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, Search, Filter, TrendingUp, Calendar, Users, MapPin } from 'lucide-react';

interface Booking {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  status: string;
  seat_numbers: string[];
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

const BookingsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  // Fetch all bookings with improved error handling
  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      // First try to get bookings with profiles
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (bookingsError) {
        toast.error(`Error loading bookings: ${bookingsError.message}`);
        throw bookingsError;
      }
      
      // Then fetch profiles separately for each booking
      const bookingsWithProfiles = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', booking.user_id)
            .single();
            
          return {
            ...booking,
            profiles: profileError ? null : { full_name: profile?.full_name || null, email: null }
          } as Booking;
        })
      );
      
      return bookingsWithProfiles;
    }
  });

  // Calculate booking statistics
  const bookingStats = React.useMemo(() => {
    if (!bookings) return { total: 0, upcoming: 0, completed: 0, cancelled: 0, revenue: 0 };
    
    return bookings.reduce((stats, booking) => {
      stats.total += 1;
      stats.revenue += Number(booking.price);
      
      switch (booking.status) {
        case 'upcoming':
          stats.upcoming += 1;
          break;
        case 'completed':
          stats.completed += 1;
          break;
        case 'cancelled':
          stats.cancelled += 1;
          break;
      }
      
      return stats;
    }, { total: 0, upcoming: 0, completed: 0, cancelled: 0, revenue: 0 });
  }, [bookings]);
  
  // Set up real-time listener for bookings
  useEffect(() => {
    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
      }, payload => {
        console.log('Booking changed:', payload);
        refetch();
        toast.success('New booking received!');
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(bookingsChannel);
    };
  }, [refetch]);
  
  // Filter bookings whenever search term, status filter, or bookings data changes
  useEffect(() => {
    if (!bookings) return;
    
    let filtered = [...bookings];
    
    if (statusFilter) {
      if (statusFilter !== 'all') {
        filtered = filtered.filter(booking => booking.status === statusFilter);
      }
    }
    
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.from_location.toLowerCase().includes(searchLower) ||
        booking.to_location.toLowerCase().includes(searchLower) ||
        booking.id.toLowerCase().includes(searchLower) ||
        booking.seat_numbers.some(seat => seat.toLowerCase().includes(searchLower)) ||
        (booking.profiles?.full_name && booking.profiles.full_name.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, bookings]);
  
  // Update booking status
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
        
      if (error) throw error;
      
      toast.success(`Booking status updated to ${newStatus}`);
      refetch();
    } catch (error: any) {
      toast.error(`Error updating booking status: ${error.message}`);
    }
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.upcoming}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Check className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.completed}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <X className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.cancelled}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {bookingStats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Bookings Management
          </CardTitle>
          <CardDescription>Manage and track all customer bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Enhanced Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookings by name, route, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={clearFilters} size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced Bookings Table */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-muted-foreground">No bookings found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold">Booking ID</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking: Booking) => (
                    <TableRow key={booking.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-xs">{booking.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {booking.profiles?.full_name || 'N/A'}
                          </span>
                          <span className="text-xs text-muted-foreground">{booking.user_id.substring(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center font-medium">
                            <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                            {booking.from_location} → {booking.to_location}
                          </div>
                          <span className="text-xs text-muted-foreground">Seats: {booking.seat_numbers.join(', ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{formatDate(booking.departure_date)}</span>
                          <span className="text-xs text-muted-foreground">{booking.departure_time} - {booking.arrival_time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">KSh {booking.price.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${
                          booking.status === 'upcoming' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : booking.status === 'completed'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {booking.status === 'upcoming' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {booking.status === 'cancelled' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-blue-500 text-blue-600 hover:bg-blue-50"
                              onClick={() => updateBookingStatus(booking.id, 'upcoming')}
                            >
                              Restore
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsManagement;
