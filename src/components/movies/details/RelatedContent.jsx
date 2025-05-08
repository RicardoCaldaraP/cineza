
import React from 'react';
import { motion } from 'framer-motion';
import MovieCard from '@/components/movies/MovieCard'; 
import { Film, Tv } from 'lucide-react';

const RelatedContent = ({ items, title, mediaType }) => {
  if (!items || items.length === 0) return null;

  const IconComponent = mediaType === 'tv' ? Tv : Film;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold text-foreground mb-5 flex items-center">
        <IconComponent className="h-6 w-6 mr-3 text-primary" />
        {title}
      </h2>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map(item => (
          <MovieCard 
            key={item.id || item.tmdb_id} 
            movie={{...item, media_type: item.media_type || mediaType}} 
            isTMDB={true} 
            compact={true} 
          />
        ))}
      </motion.div>
    </div>
  );
};

export default RelatedContent;
