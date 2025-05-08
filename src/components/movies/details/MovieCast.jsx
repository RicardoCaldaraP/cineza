
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarFallback } from '@/lib/utils';
import { UserSquare2 } from 'lucide-react';

const MovieCast = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  const TMDB_PROFILE_IMG_BASE_URL = 'https://image.tmdb.org/t/p/w185';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold text-foreground mb-5 flex items-center">
        <UserSquare2 className="h-6 w-6 mr-3 text-primary" />
        Elenco Principal
      </h2>
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {cast.map((actor) => (
          <motion.div 
            key={actor.id} 
            className="text-center bg-card p-3 rounded-lg shadow-md hover:shadow-primary/20 transition-shadow"
            variants={itemVariants}
          >
            <Avatar className="w-24 h-24 mx-auto mb-2 border-2 border-transparent hover:border-primary/50 transition-colors">
              <AvatarImage 
                src={actor.profile_path ? `${TMDB_PROFILE_IMG_BASE_URL}${actor.profile_path}` : undefined} 
                alt={actor.name} 
              />
              <AvatarFallback className="text-2xl">
                {generateAvatarFallback(actor.name)}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium text-sm text-foreground truncate">{actor.name}</p>
            <p className="text-xs text-muted-foreground truncate">{actor.character}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default MovieCast;
