
import React from 'react';
import { MapPin, Clock, Users, CreditCard } from 'lucide-react';

// Features
const features = [
  {
    icon: <MapPin className="h-10 w-10 text-brand-500" />,
    title: "Extensive Route Network",
    description: "Connect to hundreds of destinations across the country with our comprehensive route network."
  },
  {
    icon: <Clock className="h-10 w-10 text-brand-500" />,
    title: "Punctual Departures",
    description: "We pride ourselves on our timely departures and arrivals, respecting your schedule."
  },
  {
    icon: <Users className="h-10 w-10 text-brand-500" />,
    title: "Comfortable Travel",
    description: "Spacious seating, climate control, and amenities designed for your comfort."
  },
  {
    icon: <CreditCard className="h-10 w-10 text-brand-500" />,
    title: "Easy Booking & Payment",
    description: "Simple online booking system with secure payment options and instant confirmation."
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
            Why Choose TravelBus
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing an exceptional travel experience with premium amenities and reliable service
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`p-6 text-center rounded-xl bg-card border shadow-soft hover:shadow-lg transition-all hover:-translate-y-1 reveal-delay-${index + 1}`}
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
