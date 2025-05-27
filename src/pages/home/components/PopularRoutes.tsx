
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface RouteItem {
  from: string;
  to: string;
  price: string;
  duration: string;
  id?: string; // Add route ID for linking to specific route schedule
}

interface PopularRoutesProps {
  routes: RouteItem[];
  isLoading: boolean;
}

const PopularRoutes: React.FC<PopularRoutesProps> = ({ routes, isLoading }) => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
            Popular Routes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our most traveled routes with convenient schedules and great prices
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading state for routes
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden shadow-sm">
                <CardContent className="p-6">
                  <div className="h-24 flex flex-col gap-4">
                    <div className="h-6 bg-muted rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-muted rounded-full w-1/2 animate-pulse"></div>
                    <div className="h-8 bg-muted rounded w-full mt-2 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : routes.length > 0 ? (
            // Display fetched routes
            routes.map((route, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-bold text-card-foreground">{route.from}</div>
                    <div className="text-muted-foreground">→</div>
                    <div className="text-lg font-bold text-card-foreground">{route.to}</div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground mb-6">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {route.duration}
                    </div>
                    <div className="font-semibold text-brand-600 text-base">
                      {route.price}
                    </div>
                  </div>
                  
                  <Link to={route.id ? `/routes?from=${route.from}&to=${route.to}&routeId=${route.id}` : "/routes"} className="block w-full">
                    <Button className="w-full group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      View Schedule
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            // No routes found
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No routes available at the moment. Please check back later.</p>
            </div>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link to="/routes">
            <Button variant="outline" className="border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950">
              View All Routes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;
