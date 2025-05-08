
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { generateAvatarFallback } from '@/lib/utils';
import { UserPlus, UserCheck } from 'lucide-react';

const UserCard = ({ user, compact = false, onFollowToggle }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isFollowingState, setIsFollowingState] = useState(false);

  useEffect(() => {
    if (currentUser && user) {
      setIsFollowingState(currentUser.following?.includes(user.id) || false);
    }
  }, [currentUser, user]);
  
  const isCurrentUserProfile = currentUser?.id === user?.id;
  
  const handleInternalFollowToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser || !user || isCurrentUserProfile) return;

    // Optimistically update UI
    const previousFollowingState = isFollowingState;
    setIsFollowingState(!previousFollowingState);

    try {
      // Call the passed-in onFollowToggle function if available
      // This function should handle the Supabase calls and context updates
      if (onFollowToggle) {
         await onFollowToggle(user.id, user.followers, user.name || user.username);
      } else {
        // Fallback logic if onFollowToggle is not provided (though it should be for consistency)
        // This fallback is simplified and might not fully sync global state
        let newFollowersUser = user.followers ? [...user.followers] : [];
        let newFollowingCurrentUser = currentUser.following ? [...currentUser.following] : [];

        if (previousFollowingState) { // Was following, now unfollowing
          newFollowersUser = newFollowersUser.filter(id => id !== currentUser.id);
          newFollowingCurrentUser = newFollowingCurrentUser.filter(id => id !== user.id);
        } else { // Was not following, now following
          newFollowersUser.push(currentUser.id);
          newFollowingCurrentUser.push(user.id);
        }
        
        await supabase.from('users').update({ followers: newFollowersUser }).eq('id', user.id);
        await supabase.from('users').update({ following: newFollowingCurrentUser }).eq('id', currentUser.id);
        
        // Create notification if now following
        if (!previousFollowingState) {
            await supabase.rpc('create_notification', {
              p_user_id: user.id,
              p_actor_id: currentUser.id,
              p_type: 'new_follower',
              p_target_type: 'user',
              p_target_id: currentUser.id
            });
        }
        toast({
          title: !previousFollowingState ? "Seguindo" : "Deixou de seguir",
          description: `Você ${!previousFollowingState ? 'agora segue' : 'deixou de seguir'} ${user.name || user.username}.`
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsFollowingState(previousFollowingState);
      console.error("Error in UserCard follow toggle:", error);
      toast({ title: "Erro", description: "Não foi possível atualizar o status de seguir.", variant: "destructive" });
    }
  };
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { 
      y: compact ? 0 : -2, 
      boxShadow: compact ? "none" : "0 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };

  if (!user) return null;
  
  if (compact) {
    return (
      <motion.div 
        className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        <Link to={`/profile/${user.username}`} className="flex items-center gap-2 flex-grow">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url} alt={user.name || user.username} />
            <AvatarFallback>{generateAvatarFallback(user.name || user.username)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{user.name || user.username}</h3>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </Link>
        
        {!isCurrentUserProfile && (
          <Button 
            variant={isFollowingState ? "outline" : "default"} 
            size="sm"
            className="text-xs h-8 px-3 ml-2"
            onClick={handleInternalFollowToggle}
          >
            {isFollowingState ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            <span className="ml-1 hidden sm:inline">{isFollowingState ? "Seguindo" : "Seguir"}</span>
          </Button>
        )}
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="bg-card rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      <Link to={`/profile/${user.username}`} className="block">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 mb-3 border-2 border-primary/50">
            <AvatarImage src={user.avatar_url} alt={user.name || user.username} />
            <AvatarFallback className="text-2xl">{generateAvatarFallback(user.name || user.username)}</AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-lg text-foreground">{user.name || user.username}</h3>
          <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>
          {user.bio && <p className="mt-1 text-xs text-muted-foreground line-clamp-2 h-8 mb-2">{user.bio}</p>}
        </div>
      </Link>
        
      <div className="mt-3 flex items-center justify-around text-xs text-muted-foreground border-t pt-3">
        <span><strong>{user.following?.length || 0}</strong> seguindo</span>
        <span><strong>{user.followers?.length || 0}</strong> seguidores</span>
      </div>
          
      {!isCurrentUserProfile && (
        <Button 
          variant={isFollowingState ? "outline" : "default"} 
          size="sm"
          className="w-full mt-3"
          onClick={handleInternalFollowToggle}
        >
          {isFollowingState ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
          {isFollowingState ? "Seguindo" : "Seguir"}
        </Button>
      )}
    </motion.div>
  );
};

export default UserCard;
