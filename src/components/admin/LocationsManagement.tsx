
import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash } from 'lucide-react';

const locationSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  type: z.string().min(1, { message: 'Type is required' }),
});

type LocationFormValues = z.infer<typeof locationSchema>;

const LocationsManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Create form
  const addForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      type: '',
    },
  });

  // Edit form
  const editForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      type: '',
    },
  });

  // Fetch locations
  const { data: locations, isLoading, refetch } = useQuery({
    queryKey: ['admin-locations-manager'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
  });

  // Set edit form values when location is selected
  React.useEffect(() => {
    if (selectedLocation) {
      editForm.setValue('name', selectedLocation.name);
      editForm.setValue('type', selectedLocation.type);
    }
  }, [selectedLocation, editForm]);

  // Add new location
  const handleAddLocation = async (values: LocationFormValues) => {
    try {
      // Check if location with same name and type already exists
      const { data: existing } = await supabase
        .from('locations')
        .select('*')
        .eq('name', values.name)
        .eq('type', values.type);
        
      if (existing && existing.length > 0) {
        toast.error(`A location with the name "${values.name}" and type "${values.type}" already exists.`);
        return;
      }
      
      const { error } = await supabase
        .from('locations')
        .insert({
          name: values.name,
          type: values.type,
        });
        
      if (error) throw error;
      
      toast.success('Location added successfully');
      setIsAddDialogOpen(false);
      addForm.reset();
      refetch();
    } catch (error: any) {
      toast.error(`Error adding location: ${error.message}`);
    }
  };

  // Update location
  const handleEditLocation = async (values: LocationFormValues) => {
    if (!selectedLocation) return;
    
    try {
      // Check if another location with same name and type already exists
      const { data: existing } = await supabase
        .from('locations')
        .select('*')
        .eq('name', values.name)
        .eq('type', values.type)
        .neq('id', selectedLocation.id);
        
      if (existing && existing.length > 0) {
        toast.error(`A location with the name "${values.name}" and type "${values.type}" already exists.`);
        return;
      }
      
      const { error } = await supabase
        .from('locations')
        .update({
          name: values.name,
          type: values.type,
        })
        .eq('id', selectedLocation.id);
        
      if (error) throw error;
      
      toast.success('Location updated successfully');
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Error updating location: ${error.message}`);
    }
  };

  // Delete location
  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;
    
    try {
      // Check if location is used in routes
      const { data: fromRoutes } = await supabase
        .from('routes')
        .select('id')
        .eq('from_location', selectedLocation.name);
        
      const { data: toRoutes } = await supabase
        .from('routes')
        .select('id')
        .eq('to_location', selectedLocation.name);
        
      const isUsed = (fromRoutes && fromRoutes.length > 0) || (toRoutes && toRoutes.length > 0);
      
      if (isUsed) {
        toast.error('This location is being used in one or more routes and cannot be deleted.');
        setIsDeleteDialogOpen(false);
        return;
      }
      
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', selectedLocation.id);
        
      if (error) throw error;
      
      toast.success('Location deleted successfully');
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Error deleting location: ${error.message}`);
    }
  };

  // Group locations by type
  const fromLocations = locations?.filter((loc: any) => loc.type === 'from') || [];
  const toLocations = locations?.filter((loc: any) => loc.type === 'to') || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Locations Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>
      
      {/* Departure Locations */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Departure Locations</h3>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[100px]">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : fromLocations.length === 0 ? (
          <div className="text-center py-4 border rounded-md bg-gray-50">
            <p className="text-muted-foreground">No departure locations found</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fromLocations.map((location: any) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {location.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedLocation(location);
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
                            setSelectedLocation(location);
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
      </div>
      
      {/* Destination Locations */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Destination Locations</h3>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[100px]">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : toLocations.length === 0 ? (
          <div className="text-center py-4 border rounded-md bg-gray-50">
            <p className="text-muted-foreground">No destination locations found</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toLocations.map((location: any) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {location.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedLocation(location);
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
                            setSelectedLocation(location);
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
      </div>
      
      {/* Add Location Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddLocation)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Nairobi" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="from">Departure (From)</SelectItem>
                        <SelectItem value="to">Destination (To)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Location</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Location Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditLocation)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="from">Departure (From)</SelectItem>
                        <SelectItem value="to">Destination (To)</SelectItem>
                      </SelectContent>
                    </Select>
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
            <DialogTitle>Delete Location</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete <strong>{selectedLocation?.name}</strong> as a{' '}
            {selectedLocation?.type === 'from' ? 'departure' : 'destination'} location?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. Locations used in routes cannot be deleted.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLocation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationsManagement;
