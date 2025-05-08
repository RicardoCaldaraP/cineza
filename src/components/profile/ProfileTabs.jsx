
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ThumbsUp, Users, UserCheck } from 'lucide-react';
import ReviewCard from '@/components/movies/ReviewCard';
import UserCard from '@/components/UserCard';

const ProfileTabs = ({ activeTab, onTabChange, isOwnProfile, reviews, likedReviews, followers, following, currentUserId, onReviewUpdatedOrDeleted, onFollowToggle }) => {
  const tabTriggerClasses = "flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md py-2.5";
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className={`grid w-full ${isOwnProfile ? 'md:grid-cols-4 grid-cols-2' : 'md:grid-cols-3 grid-cols-2'} gap-2 mb-6 bg-secondary/30 p-1 rounded-lg`}>
        <TabsTrigger value="reviews" className={tabTriggerClasses}>
          <Star className="h-4 w-4"/> Avaliações
        </TabsTrigger>
        {isOwnProfile && (
          <TabsTrigger value="liked" className={tabTriggerClasses}>
            <ThumbsUp className="h-4 w-4"/> Curtidas
          </TabsTrigger>
        )}
        <TabsTrigger value="followers" className={tabTriggerClasses}>
          <Users className="h-4 w-4"/> Seguidores
        </TabsTrigger>
        <TabsTrigger value="following" className={tabTriggerClasses}>
          <UserCheck className="h-4 w-4"/> Seguindo
        </TabsTrigger>
      </TabsList>

      <TabsContent value="reviews">
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {reviews.map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                currentUserId={currentUserId}
                onReviewUpdated={onReviewUpdatedOrDeleted}
                onReviewDeleted={onReviewUpdatedOrDeleted}
              />
            ))}
          </div>
        ) : <p className="text-center text-muted-foreground py-8">Nenhuma avaliação ainda.</p>}
      </TabsContent>
      
      {isOwnProfile && (
        <TabsContent value="liked">
          {likedReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {likedReviews.map(review => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  currentUserId={currentUserId}
                  onReviewUpdated={onReviewUpdatedOrDeleted}
                  onReviewDeleted={onReviewUpdatedOrDeleted}
                />
              ))}
            </div>
          ) : <p className="text-center text-muted-foreground py-8">Nenhuma avaliação curtida ainda.</p>}
        </TabsContent>
      )}

      <TabsContent value="followers">
        {followers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {followers.map(user => <UserCard key={user.id} user={user} onFollowToggle={onFollowToggle} />)}
          </div>
        ) : <p className="text-center text-muted-foreground py-8">Nenhum seguidor ainda.</p>}
      </TabsContent>
      <TabsContent value="following">
        {following.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {following.map(user => <UserCard key={user.id} user={user} onFollowToggle={onFollowToggle} />)}
          </div>
        ) : <p className="text-center text-muted-foreground py-8">Não segue ninguém ainda.</p>}
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
