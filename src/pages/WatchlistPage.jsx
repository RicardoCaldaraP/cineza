
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, ListX } from 'lucide-react';
import MovieCard from '@/components/movies/MovieCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const WatchlistPage = () => {
  const { currentUser } = useAuth();
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!currentUser || !currentUser.watchlist || currentUser.watchlist.length === 0) {
        setWatchlistMovies([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .in('id', currentUser.watchlist);

      if (error) {
        console.error('Error fetching watchlist movies:', error);
        setWatchlistMovies([]);
      } else {
        setWatchlistMovies(data || []);
      }
      setIsLoading(false);
    };

    fetchWatchlist();
  }, [currentUser]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="flex items-center mb-6">
          <Film className="mr-2.5 h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Minha Lista</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8">
          {[...Array(10)].map((_, i) => <div key={i} className="shimmer aspect-[2/3] rounded-lg"></div>)}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center mb-8">
          <Film className="mr-2.5 h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Minha Lista</h1>
        </div>
        
        {watchlistMovies.length > 0 ? (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {watchlistMovies.map(movie => (
              <motion.div variants={itemVariants} key={`watchlist-${movie.id}`}>
                <MovieCard movie={movie} compact />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <ListX className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
            <p className="text-2xl font-semibold text-foreground mb-2">Sua lista está vazia.</p>
            <p className="text-muted-foreground mb-6">Adicione filmes para assisti-los mais tarde.</p>
            <Button asChild size="lg">
              <Link to="/explore">Explorar Filmes</Link>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WatchlistPage;
