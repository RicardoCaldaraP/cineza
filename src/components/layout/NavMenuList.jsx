
import React from 'react';
import { Home, Search, Film, PlusSquare } from 'lucide-react';
import NavItem from '@/components/layout/NavItem';

const NavMenuList = ({ currentPath }) => {
  const navItemsConfig = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: PlusSquare, label: 'Postar', path: '/post' },
    { icon: Search, label: 'Explorar', path: '/explore' },
    { icon: Film, label: 'Minha Lista', path: '/watchlist' },
  ];

  return (
    <nav className="flex justify-around w-full md:flex-col md:space-y-2">
      {navItemsConfig.map((item) => (
        <NavItem
          key={item.label}
          to={item.path}
          icon={item.icon}
          label={item.label}
          currentPath={currentPath}
        />
      ))}
    </nav>
  );
};

export default NavMenuList;
