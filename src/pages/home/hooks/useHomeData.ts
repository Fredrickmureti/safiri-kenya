
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocationType {
  id: string;
  name: string;
}

interface RouteType {
  id?: string;
  from: string;
  to: string;
  price: string;
  duration: string;
}

interface HomeData {
  popularRoutes: RouteType[];
  fleetImages: string[];
  locations: LocationType[];
  isLoading: boolean;
}

export const useHomeData = (): HomeData => {
  const [popularRoutes, setPopularRoutes] = useState<RouteType[]>([]);
  const [fleetImages, setFleetImages] = useState<string[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch popular routes
        const { data: routesData, error: routesError } = await supabase
          .from('routes')
          .select('*')
          .eq('is_popular', true)
          .limit(6);
        
        if (routesError) {
          console.error('Error fetching routes:', routesError);
          toast.error('Failed to load routes data');
        } else if (routesData) {
          // Transform routes data to match the UI format
          const formattedRoutes = routesData.map(route => ({
            id: route.id,
            from: route.from_location,
            to: route.to_location,
            price: `Ksh ${route.price}`,
            duration: route.duration
          }));
          setPopularRoutes(formattedRoutes);
        }

        // Fetch fleet data
        const { data: fleetData, error: fleetError } = await supabase
          .from('fleet')
          .select('image_url')
          .limit(3);
        
        if (fleetError) {
          console.error('Error fetching fleet:', fleetError);
          toast.error('Failed to load fleet data');
        } else if (fleetData) {
          const images = fleetData.map(item => item.image_url);
          setFleetImages(images.length > 0 ? images : [
            "https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
            "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
            "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
          ]);
        }

        // Fetch locations for the dropdowns
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('id, name');
        
        if (locationsError) {
          console.error('Error fetching locations:', locationsError);
        } else if (locationsData) {
          setLocations(locationsData);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    popularRoutes,
    fleetImages,
    locations,
    isLoading
  };
};
