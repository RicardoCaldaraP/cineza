
import React from 'react';
import { motion } from 'framer-motion';
import { TabsContent } from '@/components/ui/tabs';
import MovieCard from '@/components/movies/MovieCard';
import UserProfileCard from '@/components/explore/UserProfileCard'; // Assuming you'll create this or similar
import { Film, Tv, Users } from 'lucide-react';

const Skeletons = ({ count = 6, type = 'movie' }) => (
  <div className={`grid grid-cols-1 ${type === 'user' ? 'sm:grid-cols-2 md:grid-cols-3' : 'sm:grid-cols-2 md:grid-cols-3'} gap-6`}>
    {[...Array(count)].map((_, i) => (
      type === 'user' ? (
        <div key={i} className="shimmer p-4 rounded-lg flex flex-col items-center gap-3">
          <div className="shimmer w-20 h-20 rounded-full"></div>
          <div className="shimmer h-5 w-32 rounded mt-2"></div>
          <div className="shimmer h-4 w-24 rounded"></div>
        </div>
      ) : (
        <div key={i} className="shimmer aspect-video rounded-lg"></div>
      )
    ))}
  </div>
);

const EmptyState = ({ icon: Icon, message, subMessage }) => (
  <div className="text-center py-12">
    <Icon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
    <p className="text-xl text-muted-foreground">{message}</p>
    {subMessage && <p className="text-sm text-muted-foreground">{subMessage}</p>}
  </div>
);


const ExploreTabsContent = ({ activeTab, isLoading, moviesToDisplay, tvToDisplay, usersToDisplay, searchQuery, selectedGenreIds }) => {
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } }};
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const hasActiveFilterOrSearch = searchQuery.trim().length >= 2 || selectedGenreIds.length > 0;

  if (isLoading) {
    return (
      <TabsContent value={activeTab} className="mt-6">
        <Skeletons count={6} type={activeTab === 'users' ? 'user' : 'movie'} />
      </TabsContent>
    );
  }
  
  return (
    <>
      <TabsContent value="movies" className="mt-6">
        {moviesToDisplay.length > 0 ? (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8" variants={containerVariants} initial="hidden" animate="visible">
            {moviesToDisplay.map(movie => (
              <motion.div variants={itemVariants} key={`explore-movie-${movie.tmdb_id || movie.id}`}>
                <MovieCard movie={movie} isTMDB={true} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState 
            icon={Film} 
            message="Nenhum filme encontrado." 
            subMessage={hasActiveFilterOrSearch ? "Tente uma busca ou filtro diferente." : ""}
          />
        )}
      </TabsContent>
      
      <TabsContent value="tv" className="mt-6">
        {tvToDisplay.length > 0 ? (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8" variants={containerVariants} initial="hidden" animate="visible">
            {tvToDisplay.map(tvShow => (
              <motion.div variants={itemVariants} key={`explore-tv-${tvShow.tmdb_id || tvShow.id}`}>
                <MovieCard movie={tvShow} isTMDB={true} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState 
            icon={Tv} 
            message="Nenhuma série encontrada." 
            subMessage={hasActiveFilterOrSearch ? "Tente uma busca ou filtro diferente." : ""}
          />
        )}
      </TabsContent>
      
      <TabsContent value="users" className="mt-6">
        {usersToDisplay.length > 0 ? (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
            {usersToDisplay.map(user => (
              <motion.div variants={itemVariants} key={`explore-user-${user.id}`}>
                <UserProfileCard user={user} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
           <EmptyState 
            icon={Users} 
            message="Nenhum usuário encontrado." 
            subMessage={searchQuery.trim().length >= 2 ? "Tente uma busca diferente." : ""}
          />
        )}
      </TabsContent>
    </>
  );
};

export default ExploreTabsContent;
