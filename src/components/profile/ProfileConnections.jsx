
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Users } from 'lucide-react';
import UserCard from '@/components/UserCard';
import { getUserProfileById } from '@/lib/services/userService';
import { useAuth } from '@/contexts/AuthContext';

const EmptyConnectionState = ({ message }) => (
  <div className="text-center py-6 bg-card/50 rounded-lg border border-dashed border-border">
    <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);

const ProfileConnectionsComponent = ({ userId }) => {
  const [followers, setFollowers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, refreshUserProfile: refreshAuthContextUser } = useAuth();

  const fetchUserDataForList = useCallback(async (ids) => {
    if (!ids || ids.length === 0) return [];
    const usersData = await Promise.all(ids.map(id => getUserProfileById(id)));
    return usersData.filter(Boolean);
  }, []);

  const loadConnectionsData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userProfile = await getUserProfileById(userId);
      if (userProfile) {
        setFollowers(await fetchUserDataForList(userProfile.followers));
        setFollowingUsers(await fetchUserDataForList(userProfile.following));
      } else {
        setFollowers([]);
        setFollowingUsers([]);
      }
    } catch (error) {
      console.error("Error fetching connections data:", error);
      setFollowers([]);
      setFollowingUsers([]);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchUserDataForList]);

  useEffect(() => {
    loadConnectionsData();
  }, [loadConnectionsData]);

  const handleFollowStateChange = async () => {
    if (currentUser) await refreshAuthContextUser();
    // Re-fetch to update the current profile page's connection lists if someone was followed/unfollowed from here
    loadConnectionsData(); 
  };

  if (loading) return <div className="text-center py-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
      <div>
        <h3 className="font-semibold mb-4 text-lg text-foreground">Seguidores ({followers.length})</h3>
        {followers.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {followers.map(user => <UserCard key={user.id} user={user} compact onFollowToggle={handleFollowStateChange} />)}
          </div>
        ) : <EmptyConnectionState message="Nenhum seguidor ainda." />}
      </div>
      <div className="md:border-l md:pl-6 border-border">
        <h3 className="font-semibold mb-4 text-lg text-foreground">Seguindo ({followingUsers.length})</h3>
        {followingUsers.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {followingUsers.map(user => <UserCard key={user.id} user={user} compact onFollowToggle={handleFollowStateChange} />)}
          </div>
        ) : <EmptyConnectionState message="Não segue ninguém ainda." />}
      </div>
    </div>
  );
};

export default ProfileConnectionsComponent;
