
import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Tv, Star } from 'lucide-react';
import MovieCard from '@/components/movies/MovieCard';


const MovieRecommendations = ({ recommendations, currentMediaType }) => {
  if (!recommendations || recommendations.length === 0) return null;
  
  const filteredRecommendations = recommendations
    .filter(rec => rec.poster_path && (rec.media_type === 'movie' || rec.media_type === 'tv'))
    .slice(0, 6); 

  return (
    <div>
      <div className="flex items-center mb-6">
        {currentMediaType === 'tv' ? <Tv className="mr-3 h-6 w-6 text-primary" /> : <Film className="mr-3 h-6 w-6 text-primary" />}
        <h2 className="text-2xl font-semibold text-foreground">Recomendações</h2>
      </div>
      {filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {filteredRecommendations.map(rec => (
            <MovieCard key={`${rec.id}-${rec.media_type}`} movie={rec} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhuma recomendação disponível no momento.</p>
      )}
    </div>
  );
};

export default MovieRecommendations;
