import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Users, 
  CalendarDays, 
  LayoutList, 
  Car, 
  MapPin, 
  LogOut, 
  Activity,
  Menu,
  X,
  Home,
  MessageSquare,
  UserCheck,
  Mail,
  Building,
  HelpCircle
} from 'lucide-react';
import BookingsManagement from '@/components/admin/BookingsManagement';
import UsersManagement from '@/components/admin/UsersManagement';
import RoutesManagement from '@/components/admin/RoutesManagement';
import FleetManagement from '@/components/admin/FleetManagement';
import LocationsManagement from '@/components/admin/LocationsManagement';
import AdminOverview from '@/components/admin/AdminOverview';
import ReviewsManagement from '@/components/admin/ReviewsManagement';
import DriversManagement from '@/components/admin/DriversManagement';
import InboxManagement from '@/components/admin/InboxManagement';
import OfficesManagement from '@/components/admin/OfficesManagement';
import FAQManagement from '@/components/admin/FAQManagement';

const AdminDashboard = () => {
  const { adminUser, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/safiri-kenya-booking-admin-page');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Admin Header - Mobile */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 text-white fixed top-0 left-0 right-0 z-50 md:hidden shadow-xl backdrop-blur-md border-b border-slate-700/50">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white mr-2 hover:bg-white/10 transition-all duration-300"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Admin Dashboard</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-red-500/20 hover:text-red-200 transition-all duration-300"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile navigation drawer */}
        <div className={`bg-slate-800/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="py-2 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/');
                toggleMobileMenu();
              }}
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Site
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/safiri-kenya-booking-page/dashboard');
                toggleMobileMenu();
              }}
            >
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/safiri-kenya-booking-page/dashboard/bookings');
                toggleMobileMenu();
              }}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Bookings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/safiri-kenya-booking-page/dashboard/users');
                toggleMobileMenu();
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/safiri-kenya-booking-page/dashboard/drivers');
                toggleMobileMenu();
              }}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Drivers
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/safiri-kenya-booking-page/dashboard/routes');
                toggleMobileMenu();
              }}
            >
              <LayoutList className="mr-2 h-4 w-4" />
              Routes
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/safiri-kenya-booking-page/dashboard/fleet');
                toggleMobileMenu();
              }}
            >
              <Car className="mr-2 h-4 w-4" />
              Fleet
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/safiri-kenya-booking-page/dashboard/locations');
                toggleMobileMenu();
              }}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Locations
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/safiri-kenya-booking-page/dashboard/reviews');
                toggleMobileMenu();
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Reviews
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/safiri-kenya-booking-page/dashboard/inbox');
                toggleMobileMenu();
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Inbox
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/safiri-kenya-booking-page/dashboard/offices');
                toggleMobileMenu();
              }}
            >
              <Building className="mr-2 h-4 w-4" />
              Offices
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white px-4 hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                navigate('/safiri-kenya-booking-page/dashboard/faqs');
                toggleMobileMenu();
              }}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              FAQs
            </Button>
          </div>
        </div>
      </header>
      
      {/* Desktop Admin Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 text-white fixed top-0 left-0 right-0 z-40 hidden md:block shadow-xl backdrop-blur-md border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost"
              className="text-white mr-4 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Site
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Route Aura Admin
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="text-right">
              <div className="text-sm text-slate-300">Welcome back</div>
              <div className="font-medium">{adminUser?.email}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-500/20 hover:text-red-200 transition-all duration-300 transform hover:scale-105"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </header>
      
      {/* Enhanced Sidebar */}
      <aside 
        className={`fixed bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-r border-slate-200/50 dark:border-gray-700/50 h-full hidden md:block z-30 transition-all duration-500 ease-in-out pt-20 shadow-xl ${
          sidebarCollapsed ? 'md:w-16' : 'md:w-72'
        }`}
      >
        <div className="p-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="mb-6 w-full justify-center hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-300 border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500 transform hover:scale-105"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
          
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 group`}
              onClick={() => navigate('/safiri-kenya-booking-page/dashboard')}
            >
              <Activity className={`h-4 w-4 ${!sidebarCollapsed && 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
              {!sidebarCollapsed && <span className="font-medium">Overview</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 transition-all duration-300 group`}
              onClick={() => navigate('/safiri-kenya-booking-page/dashboard/bookings')}
            >
              <CalendarDays className={`h-4 w-4 ${!sidebarCollapsed && 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
              {!sidebarCollapsed && <span className="font-medium">Bookings</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:text-purple-700 transition-all duration-300 group`}
              onClick={() => navigate('/safiri-kenya-booking-page/dashboard/users')}
            >
              <Users className={`h-4 w-4 ${!sidebarCollapsed && 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
              {!sidebarCollapsed && <span className="font-medium">Users</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-700 transition-all duration-300 group`}
              onClick={() => navigate('/safiri-kenya-booking-page/dashboard/drivers')}
            >
              <UserCheck className={`h-4 w-4 ${!sidebarCollapsed && 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
              {!sidebarCollapsed && <span className="font-medium">Drivers</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} hover:bg-gradient-to-r hover:from-cyan-50 hover:to-sky-50 hover:text-cyan-700 transition-all duration-300 group`}
              onClick={() => navigate('/safiri-kenya-booking-page/dashboard/routes')}
            >
              <LayoutList className={`h-4 w-4 ${!sidebarCollapsed && 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
              {!sidebarCollapsed && <span className="font-medium">Routes</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-700 transition-all duration-300 group`}
              onClick={() => navigate('/safiri-kenya-booking-page/dashboard/fleet')}
            >
              <Car className={`h-4 w-4 ${!sidebarCollapsed && 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
              {!sidebarCollapsed && <span className="font-medium">Fleet</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:text-teal-700 transition-all duration-300 group`}
              onClick={() => navigate('/safiri-kenya-booking-page/dashboard/locations')}
            >
              <MapPin className={`h-4 w-4 ${!sidebarCollapsed && 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
              {!sidebarCollapsed && <span className="font-medium">Locations</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-700 transition-all duration-300 group`}
              onClick={() => navigate('/safiri-kenya-booking-page/dashboard/reviews')}
            >
              <MessageSquare className={`h-4 w-4 ${!sidebarCollapsed && 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
              {!sidebarCollapsed && <span className="font-medium">Reviews</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 hover:text-yellow-700 dark:hover:text-yellow-300 transition-all duration-300 group`}
              onClick={() => navigate('/safiri-kenya-booking-page/dashboard/inbox')}
            >
              <Mail className={`h-4 w-4 ${!sidebarCollapsed && 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
              {!sidebarCollapsed && <span className="font-medium">Inbox</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 group`}
              onClick={() => navigate('/safiri-kenya-booking-page/dashboard/offices')}
            >
              <Building className={`h-4 w-4 ${!sidebarCollapsed && 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
              {!sidebarCollapsed && <span className="font-medium">Offices</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 group`}
              onClick={() => navigate('/safiri-kenya-booking-page/dashboard/faqs')}
            >
              <HelpCircle className={`h-4 w-4 ${!sidebarCollapsed && 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
              {!sidebarCollapsed && <span className="font-medium">FAQs</span>}
            </Button>
          </nav>
        </div>
      </aside>
      
      {/* Main content */}
      <div className={`flex-1 transition-all duration-500 ease-in-out ${
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'
      } mt-16 md:mt-20 p-4 md:p-8`}>
        <div className="animate-fade-in">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/bookings" element={<BookingsManagement />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/drivers" element={<DriversManagement />} />
            <Route path="/routes" element={<RoutesManagement />} />
            <Route path="/fleet" element={<FleetManagement />} />
            <Route path="/locations" element={<LocationsManagement />} />
            <Route path="/reviews" element={<ReviewsManagement />} />
            <Route path="/inbox" element={<InboxManagement />} />
            <Route path="/offices" element={<OfficesManagement />} />
            <Route path="/faqs" element={<FAQManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
