import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Search, 
  Filter,
  Route,
  Star,
  ArrowRight,
  Bus,
  Users,
  Shield
} from 'lucide-react';

interface RouteData {
  id: string;
  from_location: string;
  to_location: string;
  price: number;
  duration: string;
  departure_times: string[];
  is_popular: boolean;
}

const RoutesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    searchParams.get('date') ? new Date(searchParams.get('date')!) : undefined
  );
  const [fromFilter, setFromFilter] = useState(searchParams.get('from') || '');
  const [toFilter, setToFilter] = useState(searchParams.get('to') || '');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Fetch routes
  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes', fromFilter, toFilter],
    queryFn: async () => {
      let query = supabase.from('routes').select('*');
      
      if (fromFilter && fromFilter !== 'all') {
        query = query.eq('from_location', fromFilter);
      }
      if (toFilter && toFilter !== 'all') {
        query = query.eq('to_location', toFilter);
      }
      
      const { data, error } = await query.order('is_popular', { ascending: false });
      
      if (error) throw error;
      return data as RouteData[];
    }
  });

  // Fetch locations for filters
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw error;
      return data;
    }
  });

  const handleBookRoute = (route: RouteData) => {
    if (!selectedDate) {
      toast.error('Please select a travel date');
      return;
    }
    
    const bookingParams = new URLSearchParams({
      date: selectedDate.toISOString().split('T')[0]
    });
    
    navigate(`/booking/${route.id}?${bookingParams.toString()}`);
  };

  const clearFilters = () => {
    setFromFilter('');
    setToFilter('');
    setSelectedDate(undefined);
    navigate('/routes');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/5 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-32 w-24 h-24 bg-white/5 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-display">
              Explore Our 
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Routes
              </span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Discover comfortable and reliable bus routes connecting major cities across the country
            </p>
            
            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-3 text-white animate-slide-in">
                <Shield className="h-5 w-5 mr-2 text-green-400" />
                <span>Safe Travel</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-3 text-white animate-slide-in" style={{animationDelay: '0.2s'}}>
                <Users className="h-5 w-5 mr-2 text-blue-400" />
                <span>Comfortable Seats</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-3 text-white animate-slide-in" style={{animationDelay: '0.4s'}}>
                <Clock className="h-5 w-5 mr-2 text-purple-400" />
                <span>On-Time Service</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Enhanced Search Filters */}
        <Card className="mb-8 shadow-xl border bg-card/80 backdrop-blur-md animate-zoom-in">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl text-card-foreground">
              <Filter className="h-6 w-6 mr-2 text-blue-600" />
              Find Your Perfect Route
            </CardTitle>
            <CardDescription>Filter routes by your preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* From Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                  From
                </label>
                <Select value={fromFilter || 'all'} onValueChange={(value) => setFromFilter(value === 'all' ? '' : value)}>
                  <SelectTrigger className="h-12 border-2 border-border focus:border-blue-500">
                    <SelectValue placeholder="Select departure city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {locations?.map((location) => (
                      <SelectItem key={location.id} value={location.name}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-green-600" />
                  To
                </label>
                <Select value={toFilter || 'all'} onValueChange={(value) => setToFilter(value === 'all' ? '' : value)}>
                  <SelectTrigger className="h-12 border-2 border-border focus:border-blue-500">
                    <SelectValue placeholder="Select destination city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {locations?.filter(loc => loc.name !== fromFilter).map((location) => (
                      <SelectItem key={location.id} value={location.name}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-purple-600" />
                  Travel Date
                </label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 w-full justify-start text-left font-normal border-2 border-border hover:border-blue-500"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? formatDate(selectedDate) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-transparent">Clear</label>
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="h-12 w-full border-2 border-border hover:border-red-500 hover:text-red-600"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : routes && routes.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Available Routes ({routes.length})
              </h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                Popular routes shown first
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route, index) => (
                <Card 
                  key={route.id} 
                  className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border shadow-lg bg-card/90 backdrop-blur-sm animate-fade-in ${
                    route.is_popular ? 'ring-2 ring-yellow-400' : ''
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Route className="h-5 w-5 text-blue-600 mr-2" />
                        <CardTitle className="text-lg text-card-foreground">Route {index + 1}</CardTitle>
                      </div>
                      {route.is_popular && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Route Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="font-medium">{route.from_location}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1 text-green-500" />
                          <span className="font-medium">{route.to_location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{route.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Bus className="h-4 w-4 mr-1" />
                          <span>{route.departure_times.length} trips/day</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Departure Times */}
                    <div>
                      <h4 className="font-medium text-foreground mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Departure Times
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {route.departure_times.slice(0, 4).map((time, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                        {route.departure_times.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{route.departure_times.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Price and Book Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          KSh {route.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">per seat</span>
                      </div>
                      <Button 
                        onClick={() => handleBookRoute(route)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold transform hover:scale-105 transition-all duration-200"
                      >
                        Book Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card className="text-center py-12 bg-card/80 backdrop-blur-md border shadow-lg">
            <CardContent>
              <Bus className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Routes Found</h3>
              <p className="text-muted-foreground mb-4">
                No routes match your current search criteria. Try adjusting your filters.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RoutesPage;
