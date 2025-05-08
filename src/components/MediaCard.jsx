
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Film } from 'lucide-react'; // Adicionado Film aqui
import { formatMediaData } from '@/lib/tmdb';

const MediaCard = ({ item, compact = false }) => {
  const media = formatMediaData(item);

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    hover: { y: -5, scale: 1.03, boxShadow: "0px 10px 20px rgba(var(--primary-rgb), 0.2)", transition: { duration: 0.2 } }
  };
  
  const FallbackImage = () => (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <Film className="w-12 h-12 text-muted-foreground" />
    </div>
  );

  if (compact) {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className="rounded-lg overflow-hidden shadow-lg bg-card"
      >
        <Link to={`/${media.media_type}/${media.id}`} className="block group">
          <div className="aspect-[2/3] relative">
            {media.poster_path ? (
              <img  src={media.poster_path} alt={media.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            ) : <FallbackImage /> }
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <h3 className="text-white text-sm font-semibold line-clamp-2">{media.title}</h3>
              {media.vote_average > 0 && (
                <div className="flex items-center text-xs text-yellow-400 mt-1">
                  <Star className="w-3 h-3 fill-current mr-1" />
                  {media.vote_average.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="rounded-xl overflow-hidden shadow-xl bg-card border border-border/50 group"
    >
      <Link to={`/${media.media_type}/${media.id}`} className="block">
        <div className="aspect-video relative">
           {media.backdrop_path ? (
            <img  src={media.backdrop_path} alt={`Backdrop for ${media.title}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : media.poster_path ? (
             <img  src={media.poster_path} alt={media.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : <FallbackImage /> }
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">{media.title}</h3>
          <p className="text-xs text-muted-foreground uppercase">
            {media.media_type === 'movie' ? 'Filme' : 'Série'}
            {media.release_date && ` • ${new Date(media.release_date).getFullYear()}`}
          </p>
          {media.vote_average > 0 && (
            <div className="flex items-center text-sm text-yellow-400 mt-1">
              <Star className="w-4 h-4 fill-current mr-1" />
              {media.vote_average.toFixed(1)}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{media.overview}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default MediaCard;
