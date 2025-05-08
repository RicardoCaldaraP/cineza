
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserPlus, UserCheck, Edit3, Film, Users, LogOut } from 'lucide-react';
import { generateAvatarFallback } from '@/lib/utils';

const ProfileHeader = ({ profileUser, isOwnProfile, isFollowing, onFollowToggle, onLogout }) => {
  if (!profileUser) return null;

  return (
    <Card className="mb-8 shadow-xl overflow-hidden bg-gradient-to-br from-background to-secondary/10">
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/30 to-accent/30">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      <div className="p-4 sm:p-6 -mt-20 md:-mt-24 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background shadow-lg bg-secondary">
            <AvatarImage src={profileUser.avatar_url} alt={profileUser.name || profileUser.username} />
            <AvatarFallback className="text-5xl">{generateAvatarFallback(profileUser.name || profileUser.username)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{profileUser.name || profileUser.username}</h1>
            <p className="text-muted-foreground">@{profileUser.username}</p>
            {profileUser.bio && <p className="mt-2 text-sm text-foreground/80 max-w-xl">{profileUser.bio}</p>}
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
            {isOwnProfile ? (
              <>
                <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
                  <Link to="/profile/edit">
                    <Edit3 className="mr-2 h-4 w-4" /> Editar Perfil
                  </Link>
                </Button>
                <Button variant="outline" onClick={onLogout} className="bg-background/80 backdrop-blur-sm">
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => onFollowToggle(profileUser.id, profileUser.followers, profileUser.name || profileUser.username)} 
                variant={isFollowing ? "outline" : "default"} 
                className="transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
              >
                {isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </Button>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Film className="h-4 w-4 text-primary"/> {profileUser.reviews_count || 0} Avaliações</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4 text-primary"/> {profileUser.followers_count || 0} Seguidores</span>
          <span className="flex items-center gap-1"><UserCheck className="h-4 w-4 text-primary"/> {profileUser.following_count || 0} Seguindo</span>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;
