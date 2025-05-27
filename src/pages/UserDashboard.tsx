
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard, 
  Settings, 
  Star,
  Ticket,
  TrendingUp,
  Edit,
  Phone,
  Mail
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: ''
  });

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast.error(`Error updating profile: ${error.message}`);
    },
  });

  // Calculate booking statistics
  const bookingStats = React.useMemo(() => {
    if (!bookings) return { total: 0, upcoming: 0, completed: 0, totalSpent: 0 };
    
    return bookings.reduce((stats, booking) => {
      stats.total += 1;
      stats.totalSpent += Number(booking.price);
      
      if (booking.status === 'upcoming') {
        stats.upcoming += 1;
      } else if (booking.status === 'completed') {
        stats.completed += 1;
      }
      
      return stats;
    }, { total: 0, upcoming: 0, completed: 0, totalSpent: 0 });
  }, [bookings]);

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  React.useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 ring-4 ring-blue-100">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {profile?.full_name || 'User'}!
                </h1>
                <p className="text-gray-600">Manage your bookings and profile</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <Ticket className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bookingStats.total}</div>
              <p className="text-blue-100 text-sm">All bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bookingStats.upcoming}</div>
              <p className="text-emerald-100 text-sm">Trips ahead</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bookingStats.completed}</div>
              <p className="text-purple-100 text-sm">Successful trips</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CreditCard className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">KSh {bookingStats.totalSpent.toLocaleString()}</div>
              <p className="text-orange-100 text-sm">Lifetime spending</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full lg:w-[400px] grid-cols-2 bg-white shadow-lg">
            <TabsTrigger value="bookings" className="flex items-center space-x-2">
              <Ticket className="h-4 w-4" />
              <span>My Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                <CardTitle className="flex items-center text-slate-800">
                  <Calendar className="h-6 w-6 mr-3 text-blue-500" />
                  My Bookings
                </CardTitle>
                <CardDescription>Track all your past and upcoming trips</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {bookingsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking: any) => (
                      <div key={booking.id} className="border rounded-xl p-6 bg-gradient-to-r from-white to-blue-50 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className={`${
                            booking.status === 'upcoming' 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : booking.status === 'completed'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {booking.status}
                          </Badge>
                          <span className="text-2xl font-bold text-green-600">
                            KSh {booking.price.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-semibold text-slate-800">
                                {booking.from_location} → {booking.to_location}
                              </p>
                              <p className="text-sm text-slate-600">Route</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-emerald-500" />
                            <div>
                              <p className="font-semibold text-slate-800">{formatDate(booking.departure_date)}</p>
                              <p className="text-sm text-slate-600">{booking.departure_time} - {booking.arrival_time}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Ticket className="h-4 w-4 text-purple-500" />
                              <span className="text-sm text-slate-600">
                                Seats: {booking.seat_numbers.join(', ')}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              Booked on {formatDate(booking.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ticket className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg text-gray-500 mb-2">No bookings yet</p>
                    <p className="text-sm text-gray-400">Start by booking your first trip!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                <CardTitle className="flex items-center justify-between text-slate-800">
                  <div className="flex items-center">
                    <User className="h-6 w-6 mr-3 text-blue-500" />
                    Profile Settings
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>{isEditingProfile ? 'Cancel' : 'Edit'}</span>
                  </Button>
                </CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {profileLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Full Name</span>
                        </Label>
                        {isEditingProfile ? (
                          <Input
                            id="full_name"
                            value={profileData.full_name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            {profile?.full_name || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>Phone Number</span>
                        </Label>
                        {isEditingProfile ? (
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            {profile?.phone || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>Email Address</span>
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-lg border text-gray-600">
                          {user.email}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center space-x-2">
                          <Star className="h-4 w-4" />
                          <span>Member Since</span>
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-lg border text-gray-600">
                          {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
                        </div>
                      </div>
                    </div>

                    {isEditingProfile && (
                      <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleProfileUpdate}
                          disabled={updateProfileMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-blue-600"
                        >
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
