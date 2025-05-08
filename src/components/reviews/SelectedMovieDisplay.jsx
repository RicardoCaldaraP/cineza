
import React from 'react';
import { Button } from '@/components/ui/button';
import { XCircle, Film, Tv } from 'lucide-react';

const SelectedMovieDisplay = ({ movie, onClearSelection, isEditingReview }) => {
  if (!movie) return null;

  const displayTitle = movie.title || 'Item';
  const displayYear = movie.year;
  const displayDirectorOrCreators = movie.director || movie.creators;
  const displayMediaType = movie.media_type === 'tv' ? 'Série' : 'Filme';
  
  let posterDisplayUrl = `https://via.placeholder.com/200x300.png/1f2937/FFFFFF?text=${encodeURIComponent(displayTitle)}`;
  if (movie.poster_url) {
    posterDisplayUrl = movie.poster_url;
  } else if (movie.poster_path) {
     posterDisplayUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  }


  return (
    <div className="mt-2 flex items-center justify-between p-3 border border-border bg-secondary/30 rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        <img  
            src={posterDisplayUrl} 
            alt={displayTitle} 
            className="w-16 h-24 object-cover rounded-md shadow-md" 
         />
        <div>
          <p className="font-semibold text-lg text-foreground">{displayTitle}</p>
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            {displayYear && <span>{displayYear}</span>}
            {displayYear && displayDirectorOrCreators && <span className="mx-1">•</span>}
            {displayDirectorOrCreators && <span className="truncate max-w-[150px] sm:max-w-xs">{displayDirectorOrCreators}</span>}
          </div>
          <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
            {movie.media_type === 'tv' ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
            {displayMediaType}
          </p>
        </div>
      </div>
      {!isEditingReview && (
        <Button variant="ghost" size="icon" onClick={onClearSelection} className="text-muted-foreground hover:text-destructive">
          <XCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default SelectedMovieDisplay;
