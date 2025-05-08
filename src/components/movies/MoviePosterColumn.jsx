
import React from 'react';

const MoviePosterColumn = ({ posterUrl, movieTitle }) => {
  return (
    <div className="lg:col-span-1 row-start-1 lg:row-start-auto">
      <div className="sticky top-24">
        {posterUrl ? (
          <img  
            src={posterUrl}
            alt={`Pôster de ${movieTitle}`}
            className="w-full rounded-lg shadow-lg object-contain max-h-[600px]"
           />
        ) : (
          <div className="w-full aspect-[2/3] bg-muted rounded-lg shadow-lg flex items-center justify-center">
            <p className="text-muted-foreground">Pôster Indisponível</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviePosterColumn;
