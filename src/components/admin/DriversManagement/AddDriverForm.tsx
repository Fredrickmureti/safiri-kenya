
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import bcrypt from 'bcryptjs';

interface AddDriverFormProps {
  onSuccess: () => void;
}

const driverFormSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  license_number: z.string().min(5, 'License number must be at least 5 characters'),
  experience_years: z.number().min(0, 'Experience years must be 0 or greater'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type DriverFormData = z.infer<typeof driverFormSchema>;

export const AddDriverForm: React.FC<AddDriverFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      license_number: '',
      experience_years: 0,
      password: '',
    },
  });

  const onSubmit = async (data: DriverFormData) => {
    setIsSubmitting(true);
    try {
      // First check if email already exists in drivers table
      const { data: existingDriver, error: checkError } = await supabase
        .from('drivers')
        .select('email')
        .eq('email', data.email.toLowerCase())
        .single();

      if (existingDriver) {
        toast.error('A driver with this email already exists');
        setIsSubmitting(false);
        return;
      }

      // If no existing driver found, proceed with creation
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is what we want
        toast.error(`Error checking email: ${checkError.message}`);
        setIsSubmitting(false);
        return;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Create driver record
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .insert({
          full_name: data.full_name,
          email: data.email.toLowerCase(),
          phone: data.phone || null,
          license_number: data.license_number,
          experience_years: data.experience_years,
        })
        .select()
        .single();

      if (driverError) {
        if (driverError.code === '23505' && driverError.message.includes('drivers_email_key')) {
          toast.error('A driver with this email already exists');
        } else {
          toast.error(`Failed to create driver: ${driverError.message}`);
        }
        return;
      }

      // Create driver auth record
      const { error: authError } = await supabase
        .from('driver_auth')
        .insert({
          driver_id: driverData.id,
          email: data.email.toLowerCase(),
          pass_key: hashedPassword,
        });

      if (authError) {
        // If auth creation fails, we should clean up the driver record
        await supabase.from('drivers').delete().eq('id', driverData.id);
        
        if (authError.code === '23505') {
          toast.error('Authentication record already exists for this email');
        } else {
          toast.error(`Failed to create driver authentication: ${authError.message}`);
        }
        return;
      }

      toast.success('Driver added successfully');
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(`Unexpected error: ${error.message}`);
      console.error('Error creating driver:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="license_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter license number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience_years"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience (Years)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0"
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Add Driver'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddDriverForm;
