
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Film, User, PlusSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import NavItem from '@/components/layout/NavItem';
import NotificationPopover from '@/components/layout/NotificationPopover';
import CinezaLogo from '@/components/layout/CinezaLogo';

const Navbar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const navItemsConfig = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: PlusSquare, label: 'Postar', path: '/post' },
    { icon: Search, label: 'Explorar', path: '/explore' },
    { icon: Film, label: 'Minha Lista', path: '/watchlist' },
  ];

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 
                   md:sticky md:top-0 md:flex md:flex-col md:h-screen md:w-20 lg:w-64 
                   md:border-t-0 md:border-r">
      <div className="flex justify-around items-center p-2 
                     md:flex-col md:justify-start md:h-full md:p-4 md:items-stretch">
        
        <CinezaLogo />
        
        <nav className="flex justify-around w-full md:flex-col md:space-y-2">
          {navItemsConfig.map((item) => (
            <NavItem
              key={item.label}
              to={item.path}
              icon={item.icon}
              label={item.label}
              currentPath={location.pathname}
            />
          ))}
        </nav>
        
        <div className="md:mt-auto md:space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-md text-sm font-medium md:justify-start justify-center">
             <NotificationPopover />
          </div>
          <NavItem
            to={`/profile/${currentUser.username}`}
            icon={User} 
            label="Perfil"
            currentPath={location.pathname}
            isProfile
            avatarUrl={currentUser.avatar_url || currentUser.avatar}
            username={currentUser.username}
            name={currentUser.name}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
