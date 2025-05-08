
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users, Calendar, Tag, Tv, Film as FilmIcon } from 'lucide-react';

const MovieHeader = ({ movie, reviewsCount }) => {
  if (!movie) return null;

  const backdropStyle = movie.backdrop_url
    ? { backgroundImage: `linear-gradient(to top, rgba(var(--background-rgb), 1) 0%, rgba(var(--background-rgb), 0.8) 40%, rgba(var(--background-rgb), 0.2) 70%, transparent 100%), url(${movie.backdrop_url})` }
    : { backgroundColor: 'var(--secondary)' };

  const displayRating = movie.average_rating > 0 ? movie.average_rating : movie.vote_average_tmdb;

  return (
    <motion.div 
      className="relative text-foreground rounded-xl overflow-hidden mb-8 shadow-2xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={backdropStyle}
      />
      <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end">
        <motion.img
          src={movie.poster_url || `https://via.placeholder.com/300x450.png/172A46/FFFFFF?text=${encodeURIComponent(movie.title)}`}
          alt={movie.title}
          className="w-48 md:w-60 lg:w-72 aspect-[2/3] rounded-lg shadow-xl object-cover border-4 border-background/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        <div className="flex-1 text-center md:text-left">
          <motion.h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {movie.title}
          </motion.h1>
          
          <motion.div 
            className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-foreground/80 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4, staggerChildren: 0.1 }}
          >
            <div className="flex items-center gap-1">
              {movie.media_type === 'tv' ? <Tv className="h-4 w-4" /> : <FilmIcon className="h-4 w-4" />}
              <span>{movie.media_type === 'tv' ? 'Série' : 'Filme'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{movie.year || 'N/A'}</span>
            </div>
            {movie.director && <span className="hidden sm:inline">Diretor: {movie.director}</span>}
            {movie.creators && <span className="hidden sm:inline">Criadores: {movie.creators}</span>}
          </motion.div>

          <motion.div 
            className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5, staggerChildren: 0.1 }}
          >
            {displayRating > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/20 backdrop-blur-sm rounded-full">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-base">{displayRating.toFixed(1)}</span>
                <span className="text-xs text-foreground/70">({movie.average_rating > 0 ? 'Cineza' : 'TMDB'})</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/20 backdrop-blur-sm rounded-full">
              <Users className="h-5 w-5" />
              <span className="font-semibold text-base">{reviewsCount}</span>
              <span className="text-xs text-foreground/70">Avaliações</span>
            </div>
          </motion.div>
          
          {movie.genre && (
          <motion.div 
            className="flex flex-wrap items-center justify-center md:justify-start gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {movie.genre.split(',').map(g => g.trim()).slice(0, 3).map(g => (
              <div key={g} className="flex items-center gap-1 text-xs bg-primary/20 text-primary-foreground px-2.5 py-1 rounded-full">
                <Tag className="h-3 w-3" /> {g}
              </div>
            ))}
          </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieHeader;
