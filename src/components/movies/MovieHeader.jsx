
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Film as FilmIcon, Tv } from 'lucide-react';

const MovieHeader = ({ movie, reviewsCount }) => {
  if (!movie) return null;

  const displayBackdropUrl = movie.backdrop_url || movie.poster_url;

  return (
    <div className="relative rounded-xl overflow-hidden mb-8 shadow-2xl">
      <div className="aspect-[16/7] bg-secondary">
        {displayBackdropUrl ? (
          <img src={displayBackdropUrl} alt={movie.title} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            {movie.media_type === 'tv' ? <Tv className="w-24 h-24 text-muted-foreground" /> : <FilmIcon className="w-24 h-24 text-muted-foreground" />}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end p-4 md:p-8">
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2" 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.1 }}
        >
          {movie.title}
        </motion.h1>
        <motion.p 
          className="text-sm sm:text-base text-white/80" 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.2 }}
        >
          {movie.director || movie.creators ? `${movie.director || movie.creators} • ` : ''}
          {movie.year} • {movie.genre} {movie.media_type === 'tv' ? '(Série)' : '(Filme)'}
        </motion.p>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
          {movie.average_rating > 0 && (
            <motion.div 
              className="flex items-center bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg" 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.3 }}
            >
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1.5" />
              <span className="text-white font-semibold text-lg">{movie.average_rating?.toFixed(1)}</span>
              <span className="text-white/70 text-xs ml-1.5">({reviewsCount} {reviewsCount === 1 ? 'avaliação Cineza' : 'avaliações Cineza'})</span>
            </motion.div>
          )}
          {movie.vote_average_tmdb > 0 && (
             <motion.div 
              className="flex items-center bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg" 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.35 }}
            >
              <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e6ad585bdd8583ae6af62062eb6f.svg" alt="TMDB Logo" className="w-5 h-5 mr-1.5" />
              <span className="text-white font-semibold text-lg">{movie.vote_average_tmdb?.toFixed(1)}</span>
              <span className="text-white/70 text-xs ml-1.5">(TMDB)</span>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MovieHeader;
