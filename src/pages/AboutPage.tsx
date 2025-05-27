
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

const historyMilestones = [
  {
    year: '2005',
    title: 'Company Founding',
    description: 'TravelBus was founded with just 5 buses, focusing on connecting major cities along the east coast.'
  },
  {
    year: '2010',
    title: 'Expansion Phase',
    description: 'Expanded our fleet to 50 buses and extended routes to include the midwest region.'
  },
  {
    year: '2015',
    title: 'Technology Integration',
    description: 'Launched our first mobile app and implemented digital ticketing systems for seamless booking.'
  },
  {
    year: '2018',
    title: 'Premium Fleet Introduction',
    description: 'Introduced our premium and luxury bus classes with enhanced amenities for superior comfort.'
  },
  {
    year: '2021',
    title: 'Nationwide Coverage',
    description: 'Achieved nationwide route coverage with over 200 buses connecting all major US cities.'
  },
  {
    year: '2023',
    title: 'Sustainability Initiative',
    description: 'Began transitioning to a greener fleet with the introduction of our first electric buses.'
  }
];

const teamMembers = [
  {
    name: 'Michael Johnson',
    role: 'Chief Executive Officer',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Michael has over 20 years of experience in the transportation industry and has led TravelBus to become a national leader in bus travel.'
  },
  {
    name: 'Sarah Williams',
    role: 'Chief Operations Officer',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'With a background in logistics and fleet management, Sarah ensures our nationwide operations run smoothly and efficiently.'
  },
  {
    name: 'David Chen',
    role: 'Chief Technology Officer',
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
    bio: 'David leads our technical innovations, from our booking platform to route optimization systems.'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Customer Experience Director',
    image: 'https://randomuser.me/api/portraits/women/28.jpg',
    bio: 'Emily is passionate about creating exceptional travel experiences and oversees all customer service initiatives.'
  }
];

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-brand-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display animate-fade-in">
              About TravelBus
            </h1>
            <p className="text-xl mb-6 animate-fade-in">
              Connecting cities and people with comfortable, reliable bus transportation since 2005
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-display text-gray-900">Our Story</h2>
              <p className="text-lg text-gray-700">
                TravelBus began with a simple mission: to provide affordable, comfortable transportation that connects people and places. Founded in 2005, we started with just 5 buses serving the eastern corridor.
              </p>
              <p className="text-lg text-gray-700">
                Today, we've grown to become one of the nation's premier bus transportation companies, with a modern fleet of over 200 vehicles serving routes across the entire United States.
              </p>
              <p className="text-lg text-gray-700">
                Throughout our journey, we've remained committed to our core values of reliability, comfort, and customer satisfaction. We continue to innovate and improve our services to provide the best possible travel experience.
              </p>
              <div>
                <Button className="bg-brand-600 hover:bg-brand-700">
                  Learn More About Our History
                </Button>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="TravelBus History" 
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white font-medium">Our first fleet in 2005</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Mission & Values Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">Our Mission & Values</h2>
            <p className="text-lg text-gray-700">
              We're driven by our commitment to providing exceptional bus travel experiences while maintaining high standards in every aspect of our business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Reliability</CardTitle>
                <CardDescription>The foundation of our service</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We understand that punctuality is crucial for travelers. Our commitment to schedule adherence and route reliability is unwavering, ensuring you reach your destination on time, every time.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Comfort</CardTitle>
                <CardDescription>Enjoyable journey experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Travel should be pleasant, not just a means to an end. Our buses are designed with your comfort in mind, featuring spacious seating, climate control, and modern amenities.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Sustainability</CardTitle>
                <CardDescription>Responsible transportation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We're committed to reducing our environmental impact. From implementing fuel-efficient driving practices to investing in electric buses, we're working toward a greener future.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Company Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-700">
              From humble beginnings to nationwide service, explore the key milestones in the TravelBus story.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>
            
            {/* Timeline events */}
            {historyMilestones.map((milestone, index) => (
              <div 
                key={milestone.year} 
                className={`mb-12 md:mb-0 md:pb-12 relative animate-fade-in ${
                  index % 2 === 0 ? 'md:text-right' : ''
                }`}
              >
                {/* Timeline dot */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-brand-600 border-4 border-white"></div>
                
                {/* Content */}
                <div className={`md:w-1/2 ${
                  index % 2 === 0 
                    ? 'md:pr-12 md:mr-auto' 
                    : 'md:pl-12 md:ml-auto'
                }`}>
                  <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="inline-block px-4 py-1 rounded-full bg-brand-50 text-brand-700 font-bold mb-3">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-gray-700">{milestone.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">Our Leadership Team</h2>
            <p className="text-lg text-gray-700">
              Meet the experienced professionals guiding TravelBus toward excellence in bus transportation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-brand-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-700 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-16 bg-brand-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-lg">Modern Buses</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg">Daily Routes</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-lg">Annual Passengers</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-lg">Cities Served</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">Ready to Experience TravelBus?</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join the millions of satisfied travelers who choose TravelBus for reliable, comfortable journeys.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-brand-600 hover:bg-brand-700 px-8 py-6 text-lg">
              Book Your Journey
            </Button>
            <Button variant="outline" className="border-brand-500 text-brand-600 hover:bg-brand-50 px-8 py-6 text-lg">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
