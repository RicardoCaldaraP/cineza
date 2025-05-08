
import React from 'react';
import { motion } from 'framer-motion';
import MovieCard from '@/components/movies/MovieCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { generateAvatarFallback } from '@/lib/utils';
import { Film, Tv, Users } from 'lucide-react';

const ExploreContentDisplay = ({ 
  items, 
  itemType, 
  isLoading, 
  searchQuery, 
  selectedGenreIds, 
  lastItemRef, 
  hasMore 
}) => {
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } }};
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const renderSkeletons = (count = 6, type = 'movie') => (
    <div className={`grid grid-cols-1 ${type === 'user' ? 'sm:grid-cols-2 md:grid-cols-3' : 'sm:grid-cols-2 md:grid-cols-3'} gap-6`}>
      {[...Array(count)].map((_, i) => (
        type === 'user' ? (
          <div key={i} className="shimmer p-4 rounded-lg flex flex-col items-center gap-3">
            <div className="shimmer w-20 h-20 rounded-full"></div>
            <div className="shimmer h-5 w-32 rounded mt-2"></div>
            <div className="shimmer h-4 w-24 rounded"></div>
          </div>
        ) : (
          <div key={i} className="shimmer aspect-[2/3] rounded-lg"></div>
        )
      ))}
    </div>
  );

  if (isLoading && items.length === 0) {
    return renderSkeletons(6, itemType);
  }

  if (items.length === 0) {
    let IconComponent = Film;
    let message = "Nenhum item encontrado.";
    if (itemType === 'tv') { IconComponent = Tv; message = "Nenhuma série encontrada."; }
    if (itemType === 'users') { IconComponent = Users; message = "Nenhum usuário encontrado."; }
    
    return (
      <div className="text-center py-12">
        <IconComponent className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground">{message}</p>
        {(searchQuery || selectedGenreIds.length > 0) && <p className="text-sm text-muted-foreground">Tente uma busca ou filtro diferente.</p>}
      </div>
    );
  }

  return (
    <motion.div 
      className={`grid grid-cols-1 ${itemType === 'users' ? 'sm:grid-cols-2 md:grid-cols-3' : 'sm:grid-cols-2 md:grid-cols-3'} gap-x-6 gap-y-8`} 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
    >
      {items.map((item, index) => {
        const key = itemType === 'users' ? `explore-user-${item.id}` : `explore-${itemType}-${item.tmdb_id || item.id}`;
        const isLastElement = items.length === index + 1 && hasMore;

        if (itemType === 'users') {
          return (
            <motion.div variants={itemVariants} key={key} ref={isLastElement ? lastItemRef : null}>
              <Link to={`/profile/${item.username}`} className="block p-5 bg-card hover:bg-secondary rounded-xl transition-colors shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-3 border-2 border-primary/50">
                    <AvatarImage src={item.avatar_url} alt={item.name}/>
                    <AvatarFallback>{generateAvatarFallback(item.name || item.username)}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-lg text-foreground truncate w-full">{item.name || item.username}</p>
                  <p className="text-sm text-muted-foreground truncate w-full">@{item.username}</p>
                  {item.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.bio}</p>}
                </div>
              </Link>
            </motion.div>
          );
        } else {
          return (
            <motion.div variants={itemVariants} key={key} ref={isLastElement ? lastItemRef : null}>
              <MovieCard movie={item} isTMDB={true} compact />
            </motion.div>
          );
        }
      })}
    </motion.div>
  );
};

export default ExploreContentDisplay;
