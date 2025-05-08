
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavItem from '@/components/layout/NavItem';
import NotificationPopover from '@/components/layout/NotificationPopover';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Search, Film, User, PlusSquare, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = "https://storage.googleapis.com/hostinger-horizons-assets-prod/69b9c0e1-f37b-4a24-8fcc-0e531e75a360/e3d84d5eaa1cd7081019fe77301b77da.png";

const DesktopNavbar = ({ currentPath }) => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const navItemsConfig = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: PlusSquare, label: 'Postar', path: '/post' },
    { icon: Search, label: 'Explorar', path: '/explore' },
    { icon: Film, label: 'Minha Lista', path: '/watchlist' },
  ];

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logout realizado com sucesso!" });
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <div className="hidden md:sticky md:top-0 md:flex md:flex-col md:h-screen md:w-20 lg:w-64 md:border-r md:border-border md:bg-background">
      <div className="flex flex-col justify-start h-full p-4 items-stretch">
        <Link to="/" className="flex items-center gap-2 p-0 lg:p-4 mb-6 justify-center lg:justify-start">
          <motion.div 
            initial={{ scale: 0.8, rotate: -5 }} 
            animate={{ scale: 1, rotate: 0 }} 
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex-shrink-0"
          >
            <img src={LOGO_URL} alt="Cineza Logo" className="h-8 w-8" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground hidden lg:block">Cineza</h1>
        </Link>
        
        <nav className="flex flex-col space-y-2">
          {navItemsConfig.map((item) => (
            <NavItem
              key={item.label}
              to={item.path}
              icon={item.icon}
              label={item.label}
              currentPath={currentPath}
              isDesktop={true}
            />
          ))}
        </nav>
        
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-md text-sm font-medium justify-start">
             <NotificationPopover isDesktop={true} />
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
            isDesktop={true}
          />
           <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 ease-in-out text-sm font-medium justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden lg:inline">Sair</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DesktopNavbar;
