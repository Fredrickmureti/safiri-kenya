
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search, User, Car, MapPin, Star } from 'lucide-react';
import { AddDriverForm } from './DriversManagement/AddDriverForm';
import { AssignDriverForm } from './DriversManagement/AssignDriverForm';

interface Driver {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  license_number: string;
  status: string;
  experience_years: number | null;
  total_trips: number | null;
  rating: number | null;
  created_at: string;
  driver_assignments?: {
    bus_id: string | null;
    route_id: string | null;
    fleet?: { name: string } | null;
    routes?: { from_location: string; to_location: string } | null;
  }[];
}

const DriversManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Fetch all drivers with their assignments
  const { data: drivers, isLoading, refetch } = useQuery({
    queryKey: ['admin-drivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          *,
          driver_assignments!inner(
            bus_id,
            route_id,
            fleet(name),
            routes(from_location, to_location)
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.log('Supabase error:', error);
        toast.error(`Error loading drivers: ${error.message}`);
        throw error;
      }
      
      return data || [];
    }
  });

  // Fetch fleet data for assignment
  const { data: fleetOptions } = useQuery({
    queryKey: ['fleet-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch routes data for assignment
  const { data: routeOptions } = useQuery({
    queryKey: ['route-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routes')
        .select('id, from_location, to_location')
        .order('from_location');
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Set up real-time listener for drivers
  useEffect(() => {
    const driversChannel = supabase
      .channel('drivers-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'drivers',
      }, payload => {
        console.log('Driver changed:', payload);
        refetch();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(driversChannel);
    };
  }, [refetch]);
  
  // Filter drivers
  const filteredDrivers = drivers?.filter(driver => {
    const matchesSearch = !searchTerm || 
      driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.license_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Update driver status
  const updateDriverStatus = async (driverId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ status: newStatus })
        .eq('id', driverId);
        
      if (error) throw error;
      
      toast.success(`Driver status updated to ${newStatus}`);
      refetch();
    } catch (error: any) {
      toast.error(`Error updating driver status: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Drivers Management</h2>
        <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
            </DialogHeader>
            <AddDriverForm 
              onSuccess={() => {
                setIsAddDriverOpen(false);
                refetch();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || null)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Drivers Table */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">No drivers found</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Trips</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Assignment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver: Driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{driver.full_name}</span>
                      <span className="text-xs text-muted-foreground">{driver.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{driver.phone || 'N/A'}</span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{driver.license_number}</TableCell>
                  <TableCell>{driver.experience_years || 0} years</TableCell>
                  <TableCell>{driver.total_trips || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {driver.rating ? driver.rating.toFixed(1) : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(driver.status)}>
                      {driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {driver.driver_assignments && driver.driver_assignments.length > 0 ? (
                      <div className="flex flex-col text-xs">
                        <span>{driver.driver_assignments[0].fleet?.name || 'No Bus'}</span>
                        <span className="text-muted-foreground">
                          {driver.driver_assignments[0].routes ? 
                            `${driver.driver_assignments[0].routes.from_location} → ${driver.driver_assignments[0].routes.to_location}` : 
                            'No Route'
                          }
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedDriver(driver);
                          setIsAssignDriverOpen(true);
                        }}
                      >
                        <Car className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                      {driver.status === 'active' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => updateDriverStatus(driver.id, 'inactive')}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => updateDriverStatus(driver.id, 'active')}
                        >
                          Activate
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

      {/* Assign Driver Dialog */}
      <Dialog open={isAssignDriverOpen} onOpenChange={setIsAssignDriverOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <AssignDriverForm 
              driver={selectedDriver}
              fleetOptions={fleetOptions || []}
              routeOptions={routeOptions || []}
              onSuccess={() => {
                setIsAssignDriverOpen(false);
                setSelectedDriver(null);
                refetch();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriversManagement;
