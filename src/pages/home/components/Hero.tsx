import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, MapPinIcon, ArrowRightIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const locations = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 
  'Thika', 'Malindi', 'Kitale', 'Garissa', 'Nyeri'
];

const Hero: React.FC = () => {
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [date, setDate] = useState<Date>();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (from && to && date) {
      const searchParams = new URLSearchParams({
        from,
        to,
        date: format(date, 'yyyy-MM-dd')
      });
      navigate(`/booking?${searchParams.toString()}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-display animate-fade-in">
            Your Journey 
            <span className="bg-gradient-to-r from-brand-300 to-brand-100 bg-clip-text text-transparent block">
              Starts Here
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in">
            Experience comfortable, reliable, and affordable bus travel across Kenya. 
            Book your next adventure with Route Aura.
          </p>
        </div>

        {/* Search Card */}
        <Card className="max-w-4xl mx-auto p-6 md:p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl border-0 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Find Your Perfect Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Search and book your bus tickets in just a few clicks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* From Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                From
              </label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select departure city" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700">
                  {locations.map((location) => (
                    <SelectItem key={`from-${location}`} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                To
              </label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700">
                  {locations.filter(location => location !== from).map((location) => (
                    <SelectItem key={`to-${location}`} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Departure Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
                      !date && "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-700" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="bg-white dark:bg-gray-700"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-transparent">Search</label>
              <Button 
                onClick={handleSearch}
                disabled={!from || !to || !date}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="mr-2">Search Buses</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Routes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">100+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Daily Trips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">99%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">On Time</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Hero;
