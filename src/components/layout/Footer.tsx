
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube 
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-white font-display mb-4">TravelBus</h3>
            <p className="mb-4">
              Premium bus transportation services across the country. Reliable, comfortable, and safe journeys for all travelers.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/routes" className="hover:text-brand-300 transition-colors">Bus Routes</Link>
              </li>
              <li>
                <Link to="/fleet" className="hover:text-brand-300 transition-colors">Our Fleet</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-300 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-300 transition-colors">Contact</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-brand-300 transition-colors">FAQs</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-brand-300 transition-colors">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin size={18} className="mr-3 mt-1 text-brand-400" />
                <span>123 Bus Terminal, Highway Road, Transport City, TC 54321</span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="mr-3 text-brand-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="mr-3 text-brand-400" />
                <span>info@travelbus.com</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Newsletter</h4>
            <p className="mb-4">Subscribe to our newsletter for promotions and travel updates.</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:border-brand-500"
              />
              <button 
                type="submit" 
                className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} TravelBus. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
