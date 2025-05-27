
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PopularRoutesToggle } from './RoutesManagement/PopularRoutesToggle';

const routeSchema = z.object({
  from_location: z.string().min(1, { message: 'From location is required' }),
  to_location: z.string().min(1, { message: 'To location is required' }),
  price: z.coerce.number().min(1, { message: 'Price must be greater than 0' }),
  duration: z.string().min(1, { message: 'Duration is required' }),
  departure_times: z.string().min(1, { message: 'At least one departure time is required' }),
});

type RouteFormValues = z.infer<typeof routeSchema>;

const RoutesManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [fromLocations, setFromLocations] = useState<string[]>([]);
  const [toLocations, setToLocations] = useState<string[]>([]);

  // Create form
  const addForm = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      from_location: '',
      to_location: '',
      price: 0,
      duration: '',
      departure_times: '',
    },
  });

  // Edit form
  const editForm = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      from_location: '',
      to_location: '',
      price: 0,
      duration: '',
      departure_times: '',
    },
  });

  // Fetch routes
  const { data: routes, isLoading, refetch } = useQuery({
    queryKey: ['admin-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('from_location', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*');
        
      if (error) throw error;
      return data || [];
    },
  });

  // Update locations lists when locations data changes
  useEffect(() => {
    if (locations) {
      const fromLocs = locations
        .filter((loc: any) => loc.type === 'from')
        .map((loc: any) => loc.name);
        
      const toLocs = locations
        .filter((loc: any) => loc.type === 'to')
        .map((loc: any) => loc.name);
        
      setFromLocations(fromLocs);
      setToLocations(toLocs);
    }
  }, [locations]);

  // When selectedRoute changes, update the edit form
  useEffect(() => {
    if (selectedRoute) {
      editForm.setValue('from_location', selectedRoute.from_location);
      editForm.setValue('to_location', selectedRoute.to_location);
      editForm.setValue('price', selectedRoute.price);
      editForm.setValue('duration', selectedRoute.duration);
      editForm.setValue('departure_times', selectedRoute.departure_times.join(', '));
    }
  }, [selectedRoute, editForm]);

  // Add new route
  const handleAddRoute = async (values: RouteFormValues) => {
    try {
      const departureTimes = values.departure_times
        .split(',')
        .map(time => time.trim());
        
      const { error } = await supabase
        .from('routes')
        .insert({
          from_location: values.from_location,
          to_location: values.to_location,
          price: values.price,
          duration: values.duration,
          departure_times: departureTimes,
        });
        
      if (error) throw error;
      
      toast.success('Route added successfully');
      setIsAddDialogOpen(false);
      addForm.reset();
      refetch();
    } catch (error: any) {
      toast.error(`Error adding route: ${error.message}`);
    }
  };

  // Update route
  const handleEditRoute = async (values: RouteFormValues) => {
    if (!selectedRoute) return;
    
    try {
      const departureTimes = values.departure_times
        .split(',')
        .map(time => time.trim());
        
      const { error } = await supabase
        .from('routes')
        .update({
          from_location: values.from_location,
          to_location: values.to_location,
          price: values.price,
          duration: values.duration,
          departure_times: departureTimes,
        })
        .eq('id', selectedRoute.id);
        
      if (error) throw error;
      
      toast.success('Route updated successfully');
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Error updating route: ${error.message}`);
    }
  };

  // Delete route
  const handleDeleteRoute = async () => {
    if (!selectedRoute) return;
    
    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', selectedRoute.id);
        
      if (error) throw error;
      
      toast.success('Route deleted successfully');
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Error deleting route: ${error.message}`);
    }
  };

  // Handle popular route toggle
  const handlePopularToggle = (routeId: string, isPopular: boolean) => {
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Routes Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Route
        </Button>
      </div>
      
      {/* Routes Table */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : routes?.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-card">
          <p className="text-muted-foreground">No routes found</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first route
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">From</TableHead>
                <TableHead className="text-foreground">To</TableHead>
                <TableHead className="text-foreground">Price (KSh)</TableHead>
                <TableHead className="text-foreground">Duration</TableHead>
                <TableHead className="text-foreground">Departure Times</TableHead>
                <TableHead className="text-foreground">Popular Route</TableHead>
                <TableHead className="text-right text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes?.map((route: any) => (
                <TableRow key={route.id}>
                  <TableCell className="text-foreground">{route.from_location}</TableCell>
                  <TableCell className="text-foreground">{route.to_location}</TableCell>
                  <TableCell className="text-foreground">{route.price.toLocaleString()}</TableCell>
                  <TableCell className="text-foreground">{route.duration}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {route.departure_times.map((time: string, index: number) => (
                        <span 
                          key={`${route.id}-${time}`} 
                          className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PopularRoutesToggle
                      routeId={route.id}
                      isPopular={route.is_popular || false}
                      onToggle={handlePopularToggle}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setSelectedRoute(route);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => {
                          setSelectedRoute(route);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add Route Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddRoute)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="from_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Location</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select departure location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fromLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="to_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Location</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {toLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (KSh)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (e.g. "4h 30m")</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="departure_times"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Times (comma separated, e.g. "08:00, 12:00, 16:00")</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Route</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Route Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditRoute)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="from_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Location</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select departure location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fromLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="to_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Location</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {toLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (KSh)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (e.g. "4h 30m")</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="departure_times"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Times (comma separated)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Route</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the route from{' '}
            <strong>{selectedRoute?.from_location}</strong> to{' '}
            <strong>{selectedRoute?.to_location}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoute}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoutesManagement;
