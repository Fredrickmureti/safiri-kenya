import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ArrowRight,
  AlertCircle,
  CreditCard,
  Users,
  Clock,
  CalendarIcon,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useFleetData } from '@/hooks/useFleetData';

interface Seat {
  id: string;
  number: number;
  isAvailable: boolean;
  isSelected: boolean;
  price: number;
  type: 'standard' | 'premium';
}

interface Passenger {
  name: string;
  email: string;
  phone: string;
}

interface RouteData {
  id: string;
  from_location: string;
  to_location: string;
  departure_times: string[];
  duration: string;
  price: number;
  is_popular: boolean;
}

interface ScheduleData {
  id: string;
  route_id: string;
  departure_date: string;
  departure_time: string;
  available_seats: number;
  bus_id: string | null;
}

const BookingPage: React.FC = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [busDetails, setBusDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [passenger, setPassenger] = useState<Passenger>({
    name: '',
    email: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const { user, profile } = useAuth();
  const { fleet } = useFleetData();

  // Fetch route and schedule data based on routeId
  useEffect(() => {
    const fetchRouteData = async () => {
      setIsLoading(true);
      try {
        if (!routeId) {
          toast.error('No route ID provided');
          navigate('/routes');
          return;
        }

        // Fetch route data
        const { data: routeData, error: routeError } = await supabase
          .from('routes')
          .select('*')
          .eq('id', routeId)
          .single();

        if (routeError) {
          throw routeError;
        }

        if (!routeData) {
          toast.error('Route not found');
          navigate('/routes');
          return;
        }

        setRoute(routeData);

        // Fetch the most recent schedule for this route (in a real app, you'd select based on date)
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('schedules')
          .select('*')
          .eq('route_id', routeId)
          .order('departure_date', { ascending: true })
          .limit(1)
          .single();

        if (scheduleError && scheduleError.code !== 'PGRST116') {
          throw scheduleError;
        }

        // If we have schedule data with a bus assigned
        if (scheduleData && scheduleData.bus_id) {
          setSchedule(scheduleData);

          // Fetch bus details
          const { data: busData, error: busError } = await supabase
            .from('fleet')
            .select('*')
            .eq('id', scheduleData.bus_id)
            .single();

          if (busError && busError.code !== 'PGRST116') {
            throw busError;
          }

          if (busData) {
            setBusDetails(busData);
          }
        } else {
          // If no schedule, use the first bus in the fleet as a fallback
          if (fleet && fleet.length > 0) {
            setBusDetails(fleet[0]);
          }
        }

        // Generate seats based on schedule or bus capacity
        generateSeats(scheduleData?.available_seats || 40);
      } catch (error) {
        console.error('Error fetching route data:', error);
        toast.error('Failed to load route information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRouteData();
  }, [routeId, navigate, fleet]);

  // Generate seats based on bus capacity
  const generateSeats = (capacity: number) => {
    // Create a random pattern of unavailable seats for demo purposes
    const unavailableSeats = Array(Math.floor(capacity * 0.2))
      .fill(0)
      .map(() => Math.floor(Math.random() * capacity) + 1);

    const generatedSeats: Seat[] = Array(capacity)
      .fill(null)
      .map((_, index) => ({
        id: `seat-${index + 1}`,
        number: index + 1,
        isAvailable: !unavailableSeats.includes(index + 1),
        isSelected: false,
        price: route ? route.price : 4500, // Use route price or fallback
        type: index < Math.floor(capacity * 0.1) ? 'premium' : 'standard',
      }));

    setSeats(generatedSeats);
  };

  // Pre-fill passenger info if user is logged in
  useEffect(() => {
    if (user && profile) {
      setPassenger({
        name: profile.full_name || '',
        email: user.email || '',
        phone: profile.phone || '',
      });
    }
  }, [user, profile]);

  const handleSeatSelection = (seatId: string) => {
    const updatedSeats = seats.map(seat => {
      if (seat.id === seatId) {
        if (!seat.isAvailable) {
          return seat; // Seat is not available
        }
        
        const isCurrentlySelected = !seat.isSelected;
        
        if (isCurrentlySelected && selectedSeats.length >= 5) {
          toast.error('You can select a maximum of 5 seats');
          return seat;
        }
        
        return {
          ...seat,
          isSelected: isCurrentlySelected,
        };
      }
      return seat;
    });

    setSeats(updatedSeats);
    setSelectedSeats(updatedSeats.filter(seat => seat.isSelected));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassenger({
      ...passenger,
      [name]: value,
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedSeats.length === 0) {
      setError('Please select at least one seat to continue');
      return;
    }
    
    if (currentStep === 2) {
      if (!passenger.name || !passenger.email || !passenger.phone) {
        setError('Please fill in all passenger details');
        return;
      }
    }
    
    // Check authentication before proceeding to payment
    if (currentStep === 2 && !user) {
      setShowLoginPrompt(true);
      return;
    }
    
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Check if user is logged in
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Calculate arrival time based on departure time and duration
      const departureTime = schedule?.departure_time || '08:00 AM';
      let arrivalTime = departureTime;
      
      if (route?.duration) {
        // Simple calculation for demo purposes
        const [hours, minutes] = route.duration.split('h ').map(part => parseInt(part));
        
        const departureParts = departureTime.match(/(\d+):(\d+) (\w+)/);
        if (departureParts) {
          let departureHour = parseInt(departureParts[1]);
          const departureMinute = parseInt(departureParts[2]);
          const period = departureParts[3];
          
          if (period === 'PM' && departureHour !== 12) departureHour += 12;
          if (period === 'AM' && departureHour === 12) departureHour = 0;
          
          let arrivalHour = departureHour + hours;
          let arrivalMinute = departureMinute + (minutes || 0);
          
          if (arrivalMinute >= 60) {
            arrivalHour += Math.floor(arrivalMinute / 60);
            arrivalMinute %= 60;
          }
          
          const arrivalPeriod = arrivalHour >= 12 ? 'PM' : 'AM';
          arrivalHour = arrivalHour % 12 || 12;
          
          arrivalTime = `${arrivalHour}:${arrivalMinute.toString().padStart(2, '0')} ${arrivalPeriod}`;
        }
      }

      // Insert booking into Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          route_id: routeId || '',
          from_location: route?.from_location || '',
          to_location: route?.to_location || '',
          departure_date: schedule?.departure_date || new Date().toISOString().split('T')[0],
          departure_time: schedule?.departure_time || '08:00 AM',
          arrival_time: arrivalTime,
          seat_numbers: selectedSeats.map(seat => seat.number.toString()),
          price: getTotalPrice(),
          status: 'upcoming'
        });
        
      if (error) throw error;
      
      setIsProcessing(false);
      toast.success('Booking confirmed! Check your email for details.');
      navigate('/bookings');
    } catch (error: any) {
      setIsProcessing(false);
      toast.error(error.message || 'Failed to complete booking');
      console.error('Error creating booking:', error);
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  // Calculate arrival time based on departure time and duration
  const getArrivalTime = () => {
    if (!route || !route.duration) return schedule?.departure_time || '';
    
    const departureTime = schedule?.departure_time || '08:00 AM';
    
    // Simple calculation for demo purposes
    const [hours, minutes] = route.duration.split('h ').map(part => parseInt(part));
    
    const departureParts = departureTime.match(/(\d+):(\d+) (\w+)/);
    if (!departureParts) return departureTime;
    
    let departureHour = parseInt(departureParts[1]);
    const departureMinute = parseInt(departureParts[2]);
    const period = departureParts[3];
    
    if (period === 'PM' && departureHour !== 12) departureHour += 12;
    if (period === 'AM' && departureHour === 12) departureHour = 0;
    
    let arrivalHour = departureHour + hours;
    let arrivalMinute = departureMinute + (minutes || 0);
    
    if (arrivalMinute >= 60) {
      arrivalHour += Math.floor(arrivalMinute / 60);
      arrivalMinute %= 60;
    }
    
    const arrivalPeriod = arrivalHour >= 12 ? 'PM' : 'AM';
    arrivalHour = arrivalHour % 12 || 12;
    
    return `${arrivalHour}:${arrivalMinute.toString().padStart(2, '0')} ${arrivalPeriod}`;
  };

  const renderSeatPicker = () => {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold">Select Your Seats</h3>
          <p className="text-gray-500">
            Click on available seats to select them. You can select up to 5 seats.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-6 flex items-center">
            <AlertCircle className="mr-2" size={18} />
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-center mb-4 space-x-6">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-md bg-gray-200 border border-gray-300 mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-md bg-brand-500 border border-brand-600 mr-2"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-md bg-gray-400 border border-gray-500 mr-2"></div>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
          
          {/* Bus Layout */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="bg-gray-100 rounded-t-lg p-2 text-center font-medium text-gray-700 mb-4">
              Front of Bus
            </div>
            
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
              {/* Driver seat */}
              <div className="col-span-4 flex justify-end mb-4">
                <div className="w-10 h-10 rounded-md bg-gray-800 text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              
              {/* Seats */}
              {seats.map((seat) => (
                <div 
                  key={seat.id} 
                  className={`
                    w-10 h-10 rounded-md flex items-center justify-center cursor-pointer transition-all
                    ${seat.isAvailable 
                      ? seat.isSelected 
                        ? 'bg-brand-500 text-white hover:bg-brand-600 border border-brand-600' 
                        : 'bg-gray-200 hover:bg-gray-300 border border-gray-300' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed border border-gray-500'
                    }
                    ${seat.type === 'premium' ? 'ring-2 ring-yellow-400' : ''}
                  `}
                  onClick={() => seat.isAvailable && handleSeatSelection(seat.id)}
                >
                  {seat.number}
                </div>
              ))}
            </div>
            
            <div className="bg-gray-100 rounded-b-lg p-2 text-center font-medium text-gray-700 mt-4">
              Back of Bus
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-medium mb-2">Selected Seats</h4>
          {selectedSeats.length > 0 ? (
            <div className="space-y-2">
              {selectedSeats.map((seat) => (
                <div key={seat.id} className="flex justify-between">
                  <div className="flex items-center">
                    <span className="rounded-md bg-brand-500 text-white w-8 h-8 flex items-center justify-center mr-2">
                      {seat.number}
                    </span>
                    <span>{seat.type === 'premium' ? 'Premium Seat' : 'Standard Seat'}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(seat.price)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No seats selected</p>
          )}
        </div>
      </div>
    );
  };

  const renderPassengerDetails = () => {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold">Passenger Details</h3>
          <p className="text-gray-500">
            Enter the details of the main passenger
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-6 flex items-center">
            <AlertCircle className="mr-2" size={18} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={passenger.name}
              onChange={handleInputChange}
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={passenger.email}
              onChange={handleInputChange}
              placeholder="john.doe@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={passenger.phone}
              onChange={handleInputChange}
              placeholder="0712345678"
            />
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Special Requests (Optional)</h4>
            <textarea
              className="w-full rounded-md border border-gray-300 p-2 h-24 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Any special requirements or requests?"
            ></textarea>
          </div>
        </div>

        {/* Login Prompt */}
        {showLoginPrompt && !user && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium text-blue-800 mb-2">Authentication Required</h4>
            <p className="text-blue-700 mb-3">
              You need to be logged in to complete your booking. This helps you manage your bookings and receive updates.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/booking/${routeId}`)}`)}
                className="bg-brand-600 hover:bg-brand-700"
              >
                Sign In
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(`/signup?redirect=${encodeURIComponent(`/booking/${routeId}`)}`)}
              >
                Create Account
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPaymentSection = () => {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold">Payment</h3>
          <p className="text-gray-500">
            Complete your booking by selecting a payment method
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Payment Method</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div
                className={`
                  border rounded-md p-4 cursor-pointer transition-all
                  ${paymentMethod === 'creditCard' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}
                `}
                onClick={() => setPaymentMethod('creditCard')}
              >
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full border border-gray-300 mr-2 flex items-center justify-center">
                    {paymentMethod === 'creditCard' && (
                      <div className="h-3 w-3 rounded-full bg-brand-500"></div>
                    )}
                  </div>
                  <div>Credit/Debit Card</div>
                </div>
              </div>
              
              <div
                className={`
                  border rounded-md p-4 cursor-pointer transition-all
                  ${paymentMethod === 'mpesa' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}
                `}
                onClick={() => setPaymentMethod('mpesa')}
              >
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full border border-gray-300 mr-2 flex items-center justify-center">
                    {paymentMethod === 'mpesa' && (
                      <div className="h-3 w-3 rounded-full bg-brand-500"></div>
                    )}
                  </div>
                  <div>M-Pesa</div>
                </div>
              </div>
            </div>
          </div>
          
          {paymentMethod === 'creditCard' && (
            <div className="space-y-4 bg-white rounded-lg p-4 border border-gray-200">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="nameOnCard">Name on Card</Label>
                <Input
                  id="nameOnCard"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}
          
          {paymentMethod === 'mpesa' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="mb-4">Enter your phone number to receive M-Pesa payment prompt</p>
              <div>
                <Label htmlFor="mpesaPhone">Phone Number</Label>
                <Input
                  id="mpesaPhone"
                  placeholder="07XX XXX XXX"
                  defaultValue={passenger.phone}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-medium mb-2">Order Summary</h4>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Selected Seats ({selectedSeats.length})</span>
              <span>{formatCurrency(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between">
              <span>Booking Fee</span>
              <span>{formatCurrency(500)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(Math.round(getTotalPrice() * 0.08))}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatCurrency(Math.round(getTotalPrice() + 500 + (getTotalPrice() * 0.08)))}</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            By completing this booking, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Route Summary Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : route ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{route.from_location} to {route.to_location}</h2>
                  <div className="flex items-center text-gray-500 mb-4">
                    <CalendarIcon size={16} className="mr-1" />
                    <span>
                      {schedule && schedule.departure_date ? 
                        new Date(schedule.departure_date).toLocaleDateString('en-US', { 
                          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
                        }) : 
                        'Date not specified'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Departure</div>
                      <div className="font-semibold">{schedule?.departure_time || 'TBD'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Arrival</div>
                      <div className="font-semibold">{getArrivalTime()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="font-semibold flex items-center">
                        <Clock size={14} className="mr-1" />
                        {route.duration || 'TBD'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Bus Type</div>
                      <div className="font-semibold">{busDetails?.name || 'Standard'}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-sm text-gray-500">Fare per seat</div>
                  <div className="text-2xl font-bold text-brand-600">{formatCurrency(route.price)}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Route information not available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Steps */}
        <div className="mb-8 flex items-center justify-center max-w-2xl mx-auto">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 1 ? 'bg-brand-600 text-white' : 'bg-brand-600 text-white'}`}>
            1
          </div>
          <div className={`h-1 flex-1 ${currentStep > 1 ? 'bg-brand-600' : 'bg-gray-300'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 2 ? 'bg-brand-600 text-white' : currentStep > 2 ? 'bg-brand-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            2
          </div>
          <div className={`h-1 flex-1 ${currentStep > 2 ? 'bg-brand-600' : 'bg-gray-300'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 3 ? 'bg-brand-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            3
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 ? 'Select Seats' : 
                 currentStep === 2 ? 'Passenger Details' : 'Payment'}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 ? 'Choose your preferred seats on the bus' : 
                 currentStep === 2 ? 'Enter passenger information' : 'Complete payment to confirm booking'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {currentStep === 1 && renderSeatPicker()}
                  {currentStep === 2 && renderPassengerDetails()}
                  {currentStep === 3 && renderPaymentSection()}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handleBack} disabled={isLoading || isProcessing}>
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={isLoading}>
                  Continue <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || isProcessing || !user} 
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : 'Confirm Booking'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
