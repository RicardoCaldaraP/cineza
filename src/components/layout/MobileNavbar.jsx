
import React from 'react';
import NavItem from '@/components/layout/NavItem';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Search, Film, User, PlusSquare } from 'lucide-react';
import NotificationPopover from '@/components/layout/NotificationPopover';


const MobileNavbar = ({ currentPath }) => {
  const { currentUser } = useAuth();

  const navItemsConfig = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: PlusSquare, label: 'Postar', path: '/post' },
    { icon: Search, label: 'Explorar', path: '/explore' },
    { icon: Film, label: 'Minha Lista', path: '/watchlist' },
  ];

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <nav className="flex justify-around items-center h-16">
        {navItemsConfig.map((item) => (
          <NavItem
            key={item.label}
            to={item.path}
            icon={item.icon}
            label={item.label}
            currentPath={currentPath}
            isDesktop={false}
          />
        ))}
         <div className="flex flex-col items-center justify-center text-xs h-16 w-full text-muted-foreground hover:text-primary">
            <NotificationPopover isDesktop={false} />
         </div>
        <NavItem
            to={`/profile/${currentUser.username}`}
            icon={User} 
            label="Perfil"
            currentPath={currentPath}
            isProfile
            avatarUrl={currentUser.avatar_url || currentUser.avatar}
            username={currentUser.username}
            name={currentUser.name}
            isDesktop={false}
          />
      </nav>
    </div>
  );
};

export default MobileNavbar;
