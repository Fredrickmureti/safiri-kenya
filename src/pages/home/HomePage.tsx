
import React from 'react';
import { useHomeData } from './hooks/useHomeData';
import Hero from './components/Hero';
import PopularRoutes from './components/PopularRoutes';
import Features from './components/Features';
import Fleet from './components/Fleet';
import Testimonials from './components/Testimonials';
import CallToAction from './components/CallToAction';

const HomePage: React.FC = () => {
  const { popularRoutes, fleetImages, locations, isLoading } = useHomeData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Search Form */}
      <Hero locations={locations} isLoading={isLoading} />
      
      {/* Popular Routes Section */}
      <PopularRoutes routes={popularRoutes} isLoading={isLoading} />
      
      {/* Features Section */}
      <Features />
      
      {/* Fleet Section */}
      <Fleet fleetImages={fleetImages} isLoading={isLoading} />
      
      {/* Testimonials Section */}
      <Testimonials />
      
      {/* CTA Section */}
      <CallToAction />
    </div>
  );
};

export default HomePage;
