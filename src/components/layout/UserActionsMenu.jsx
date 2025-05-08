
import React from 'react';
import { User } from 'lucide-react';
import NavItem from '@/components/layout/NavItem';
import NotificationPopover from '@/components/layout/NotificationPopover';
import { useAuth } from '@/contexts/AuthContext';

const UserActionsMenu = ({ currentPath }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div className="md:mt-auto md:space-y-2">
      <div className="flex items-center gap-3 p-3 rounded-md text-sm font-medium md:justify-start justify-center">
         <NotificationPopover />
      </div>
      <NavItem
        to={`/profile/${currentUser.username}`}
        icon={User} 
        label="Perfil"
        currentPath={currentPath}
        isProfile
        avatarUrl={currentUser.avatar_url || currentUser.user_metadata?.avatar_url}
        username={currentUser.username || currentUser.user_metadata?.username}
        name={currentUser.name || currentUser.user_metadata?.name}
      />
    </div>
  );
};

export default UserActionsMenu;
