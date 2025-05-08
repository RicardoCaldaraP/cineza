
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Clock, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toggleWatchlistMovie, getCurrentUser, getReviewsByMovie } from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';

const MovieCard = ({ movie, compact = false }) => {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const reviews = getReviewsByMovie(movie.id);
  
  const isInWatchlist = currentUser?.watchlist.includes(movie.id);
  
  const handleToggleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (toggleWatchlistMovie(currentUser.id, movie.id)) {
      toast({
        title: isInWatchlist ? "Removido da lista" : "Adicionado à lista",
        description: isInWatchlist 
          ? `${movie.title} foi removido da sua lista de filmes para assistir.` 
          : `${movie.title} foi adicionado à sua lista de filmes para assistir.`,
        duration: 3000,
      });
    }
  };
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { 
      y: -5, 
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
      transition: { duration: 0.2 }
    }
  };
  
  if (compact) {
    return (
      <motion.div 
        className="movie-card w-full"
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        <Link to={`/movie/${movie.id}`} className="block">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
            <img 
              src={movie.poster} 
              alt={movie.title} 
              className="w-full h-full object-cover"
            />
            <div className="movie-card-overlay">
              <h3 className="text-white font-bold">{movie.title}</h3>
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-sm ml-1">{movie.averageRating}</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="movie-card w-full bg-card rounded-lg overflow-hidden shadow-lg"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={movie.poster} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 z-10">
            <motion.button
              onClick={handleToggleWatchlist}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full ${isInWatchlist ? 'bg-primary' : 'bg-black/50'}`}
            >
              <Clock className={`w-5 h-5 ${isInWatchlist ? 'text-white' : 'text-white'}`} />
            </motion.button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{movie.title}</h3>
              <p className="text-muted-foreground text-sm">{movie.director}, {movie.year}</p>
            </div>
            <div className="flex items-center bg-secondary px-2 py-1 rounded-md">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm ml-1 font-medium">{movie.averageRating}</span>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{movie.description}</p>
          
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              <span>{reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</span>
            </div>
            <span className="px-2 py-1 bg-secondary rounded-md">{movie.genre}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
