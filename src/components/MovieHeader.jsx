
import React from 'react';
import { Star } from 'lucide-react';
import { getImageUrl, getDirector } from '@/lib/tmdb';

const MovieHeader = ({ movie }) => {
  const backdropUrl = getImageUrl(movie.backdrop_path || movie.poster_path, 'w1280');
  const director = getDirector(movie.credits);
  const averageRating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  return (
    <div className="relative rounded-xl overflow-hidden mb-6 shadow-lg">
      <div className="aspect-video bg-muted">
        <img 
          src={backdropUrl} 
          alt={`Poster de ${movie.title}`} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 line-clamp-2">{movie.title}</h1>
            <p className="text-white/80 text-sm">
              {director !== 'Desconhecido' ? `${director}, ` : ''} 
              {movie.release_date ? movie.release_date.substring(0, 4) : ''}
            </p>
          </div>
          {averageRating !== 'N/A' && (
            <div className="flex-shrink-0 flex items-center bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg mt-2 sm:mt-0">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-white font-bold text-sm md:text-base">{averageRating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieHeader;
