
import React from 'react';
import { Users } from 'lucide-react';

const MovieCast = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  const displayedCast = cast.slice(0, 10);

  return (
    <div>
      <div className="flex items-center mb-4">
        <Users className="mr-3 h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">Elenco Principal</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayedCast.map((member) => (
          <div key={member.id} className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mb-2 shadow-md">
              {member.profile_path ? (
                <img  
                  src={`https://image.tmdb.org/t/p/w185${member.profile_path}`} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                 />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-foreground">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.character}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieCast;
