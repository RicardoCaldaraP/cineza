
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';

const ProfilePage = () => {
  const { username } = useParams();
  const { currentUser, logout, updateUserProfileData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  const { toast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [likedReviews, setLikedReviews] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userByUsername, error: usernameError } = await supabase
        .from('users')
        .select('*, reviews_count:reviews(count)') 
        .eq('username', username)
        .single();
      
      if (usernameError || !userByUsername) {
        toast({ title: "Erro", description: "Perfil não encontrado.", variant: "destructive" });
        navigate('/'); 
        return;
      }
      
      const enrichedUser = {
        ...userByUsername,
        reviews_count: userByUsername.reviews_count?.[0]?.count || 0,
        followers_count: userByUsername.followers?.length || 0,
        following_count: userByUsername.following?.length || 0,
      };
      setProfileUser(enrichedUser);

      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*, movies(*), users!inner(id, username, name, avatar_url)')
        .eq('users.id', userByUsername.id)
        .order('created_at', { ascending: false });
      if (reviewError) throw reviewError;
      setReviews(reviewData || []);

      if (currentUser?.id === userByUsername.id) {
        const { data: likedData, error: likedError } = await supabase
          .from('likes')
          .select('reviews(*, movies(*), users!inner(id, username, name, avatar_url))')
          .eq('user_id', userByUsername.id)
          .order('created_at', { ascending: false });
        if (likedError) throw likedError;
        setLikedReviews(likedData.map(like => like.reviews).filter(Boolean) || []);
      }

      if (userByUsername.followers && userByUsername.followers.length > 0) {
        const { data: followersData, error: followersError } = await supabase
          .from('users')
          .select('*')
          .in('id', userByUsername.followers);
        if (followersError) throw followersError;
        setFollowers(followersData || []);
      } else {
        setFollowers([]);
      }

      if (userByUsername.following && userByUsername.following.length > 0) {
        const { data: followingData, error: followingError } = await supabase
          .from('users')
          .select('*')
          .in('id', userByUsername.following);
        if (followingError) throw followingError;
        setFollowing(followingData || []);
      } else {
        setFollowing([]);
      }

      if (currentUser && userByUsername.followers) {
        setIsFollowingState(userByUsername.followers.includes(currentUser.id));
      }

    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast({ title: "Erro ao carregar perfil", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [username, currentUser, navigate, toast]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollowToggle = async (targetUserId, targetUserCurrentFollowers, targetUserName) => {
    if (!currentUser || !targetUserId || currentUser.id === targetUserId) return;
  
    const currentlyFollowingTarget = targetUserCurrentFollowers?.includes(currentUser.id) || false;
    let newFollowersForTarget = targetUserCurrentFollowers ? [...targetUserCurrentFollowers] : [];
    let newFollowingForCurrentUser = currentUser.following ? [...currentUser.following] : [];
  
    if (currentlyFollowingTarget) {
      newFollowersForTarget = newFollowersForTarget.filter(id => id !== currentUser.id);
      newFollowingForCurrentUser = newFollowingForCurrentUser.filter(id => id !== targetUserId);
    } else {
      if (!newFollowersForTarget.includes(currentUser.id)) newFollowersForTarget.push(currentUser.id);
      if (!newFollowingForCurrentUser.includes(targetUserId)) newFollowingForCurrentUser.push(targetUserId);
    }
  
    try {
      const { error: targetUserUpdateError } = await supabase
        .from('users')
        .update({ followers: newFollowersForTarget })
        .eq('id', targetUserId);
      if (targetUserUpdateError) throw targetUserUpdateError;
  
      const { error: currentUserUpdateError } = await supabase
        .from('users')
        .update({ following: newFollowingForCurrentUser })
        .eq('id', currentUser.id);
      if (currentUserUpdateError) throw currentUserUpdateError;
      
      if (profileUser && targetUserId === profileUser.id) {
        setProfileUser(prev => ({ 
          ...prev, 
          followers: newFollowersForTarget,
          followers_count: newFollowersForTarget.length
        }));
        setIsFollowingState(!currentlyFollowingTarget);
      }
      
      updateUserProfileData({ 
        following: newFollowingForCurrentUser,
      });
  
      if (location.pathname.startsWith(`/profile/${username}`)) {
         fetchProfileData(); 
      }

      if (!currentlyFollowingTarget) {
        const { error: notificationError } = await supabase.rpc('create_notification', {
          p_user_id: targetUserId,
          p_actor_id: currentUser.id,
          p_type: 'new_follower',
          p_target_type: 'user',
          p_target_id: currentUser.id 
        });
        if (notificationError) console.error("Error creating follow notification:", notificationError);
      }
  
      toast({ 
        title: currentlyFollowingTarget ? "Deixou de seguir" : "Seguindo", 
        description: `Você ${currentlyFollowingTarget ? 'deixou de seguir' : 'agora segue'} ${targetUserName}.` 
      });
  
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({ title: "Erro", description: "Não foi possível atualizar o status de seguir.", variant: "destructive" });
    }
  };
  
  const onReviewUpdatedOrDeleted = () => {
    fetchProfileData(); 
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logout realizado com sucesso!" });
      navigate('/login');
    } catch (error) {
      toast({ title: "Erro no Logout", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading || !profileUser) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-8">
          <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex-1 text-center md:text-left">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-2 sm:px-4 py-8"
    >
      <ProfileHeader 
        profileUser={profileUser}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowingState}
        onFollowToggle={handleFollowToggle}
        onLogout={handleLogout}
      />
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOwnProfile={isOwnProfile}
        reviews={reviews}
        likedReviews={likedReviews}
        followers={followers}
        following={following}
        currentUserId={currentUser?.id}
        onReviewUpdatedOrDeleted={onReviewUpdatedOrDeleted}
        onFollowToggle={handleFollowToggle}
      />
    </motion.div>
  );
};

export default ProfilePage;
