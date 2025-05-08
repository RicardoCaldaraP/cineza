
import React from 'react';
import { motion } from 'framer-motion';
import MovieCard from '@/components/movies/MovieCard';

const ExploreResultsGrid = ({ items, type, lastElementRef, containerVariants }) => {
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
  
  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8" 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.div 
          ref={items.length === index + 1 ? lastElementRef : null} 
          variants={itemVariants} 
          key={`explore-${type}-${item.tmdb_id || item.id}`}
        >
          <MovieCard movie={item} isTMDB={true} compact />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ExploreResultsGrid;
