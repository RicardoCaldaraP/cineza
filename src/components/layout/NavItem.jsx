
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateAvatarFallback } from '@/lib/utils';

const NavItem = ({ to, icon: Icon, label, currentPath, isProfile = false, avatarUrl, username, name }) => {
  const isActive = (path) => {
    if (path === '/') return currentPath === path;
    if (path === '/post' && currentPath.startsWith('/post')) return true; // Catches /post and /post?edit=...
    if (path === '/profile' && currentPath.startsWith('/profile/')) return true; // For dynamic profile routes
    return currentPath.startsWith(path) && path !== '/'; // General case
  };
  
  const activeClasses = "bg-primary/10 text-primary dark:bg-primary dark:text-primary-foreground";
  const inactiveClasses = "hover:bg-accent hover:text-accent-foreground";

  const effectivePath = isProfile ? `/profile/${username}` : to;

  return (
    <Link
      to={effectivePath}
      className={`flex items-center gap-3 p-3 rounded-md transition-colors duration-150 ease-in-out text-sm font-medium
                  ${isActive(to) ? activeClasses : inactiveClasses}
                  md:justify-start justify-center`}
    >
      {isProfile ? (
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatarUrl} alt={name || username} />
          <AvatarFallback>{generateAvatarFallback(name || username)}</AvatarFallback>
        </Avatar>
      ) : (
        <Icon className="h-5 w-5" />
      )}
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
};

export default NavItem;
