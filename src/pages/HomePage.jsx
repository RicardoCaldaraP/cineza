
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Activity, Film as FilmIcon, Tv, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ReviewCard from '@/components/movies/ReviewCard';
import MovieCard from '@/components/movies/MovieCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { generateAvatarFallback } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getTrendingTMDB, searchTMDB } from '@/lib/tmdbService';

const HomePage = () => {
  const { currentUser } = useAuth();
  const [feedReviews, setFeedReviews] = useState([]);
  const [trendingContent, setTrendingContent] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ movies: [], users: [] });
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [trendingItemsToShow, setTrendingItemsToShow] = useState(6);

  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoadingFeed(true);
      if (!currentUser || !currentUser.following || currentUser.following.length === 0) {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            users (id, username, name, avatar_url),
            movies (*)
          `)
          .order('created_at', { ascending: false })
          .limit(10);
        if (error) console.error('Error fetching global feed:', error);
        else setFeedReviews(data || []);
      } else {
        const followingIds = [...currentUser.following, currentUser.id]; 
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            users (id, username, name, avatar_url),
            movies (*)
          `)
          .in('user_id', followingIds)
          .order('created_at', { ascending: false })
          .limit(20);
        if (error) console.error('Error fetching user feed:', error);
        else setFeedReviews(data || []);
      }
      setIsLoadingFeed(false);
    };

    const fetchTrending = async () => {
      setIsLoadingTrending(true);
      try {
        const trendingData = await getTrendingTMDB('all', 'week');
        setTrendingContent(trendingData || []); 
      } catch (error) {
        console.error('Error fetching trending TMDB:', error);
        setTrendingContent([]);
      }
      setIsLoadingTrending(false);
    };

    if (currentUser) fetchFeed(); else setIsLoadingFeed(false);
    fetchTrending();
  }, [currentUser]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults({ movies: [], users: [] });
        setIsLoadingSearch(false);
        return;
      }
      setIsLoadingSearch(true);
      
      try {
        const [tmdbRes, usersRes] = await Promise.all([
          searchTMDB(searchQuery.trim()),
          supabase.from('users').select('id, username, name, avatar_url').or(`username.ilike.%${searchQuery.trim()}%,name.ilike.%${searchQuery.trim()}%`).limit(5)
        ]);

        setSearchResults({
          movies: tmdbRes.results || [],
          users: usersRes.data || []
        });
      } catch (error) {
        console.error("Error during search:", error);
        setSearchResults({ movies: [], users: [] });
      }
      setIsLoadingSearch(false);
    };

    const debounceSearch = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [searchQuery]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleToggleTrendingItems = () => {
    setTrendingItemsToShow(prev => prev === 6 ? trendingContent.length : 6);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="relative mb-8">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Buscar filmes, séries, usuários..."
          className="pl-12 pr-4 py-3 text-base rounded-lg search-input focus:ring-primary/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {searchQuery.trim().length > 1 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Resultados da Busca</h2>
          {isLoadingSearch && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>}
          {!isLoadingSearch && searchResults.movies.length === 0 && searchResults.users.length === 0 && (
            <p className="text-muted-foreground text-center py-8">Nenhum resultado encontrado para "{searchQuery}".</p>
          )}

          {searchResults.movies.length > 0 && (
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-primary flex items-center"><FilmIcon className="mr-2 h-5 w-5" />Filmes e Séries</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {searchResults.movies.map(movie => (
                  <motion.div variants={itemVariants} key={`search-movie-${movie.tmdb_id}`}>
                    <MovieCard movie={movie} isTMDB={true} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {searchResults.users.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4 text-primary">Usuários</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {searchResults.users.map(user => (
                  <motion.div variants={itemVariants} key={`search-user-${user.id}`}>
                     <Link to={`/profile/${user.username}`} className="block p-4 bg-card hover:bg-secondary rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.avatar_url} alt={user.name}/>
                                <AvatarFallback>{generateAvatarFallback(user.name || user.username)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-foreground">{user.name || user.username}</p>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                        </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </motion.div>
      ) : (
        <>
          <section className="mb-10">
            <div className="flex items-center mb-5">
              <TrendingUp className="mr-2.5 h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Em Alta</h2>
            </div>
            {isLoadingTrending ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8">
                {[...Array(6)].map((_, i) => <div key={i} className="shimmer aspect-[2/3] rounded-lg"></div>)}
              </div>
            ) : trendingContent.length > 0 ? (
              <>
                <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8" variants={containerVariants} initial="hidden" animate="visible">
                  {trendingContent.slice(0, trendingItemsToShow).map(contentItem => (
                    <motion.div variants={itemVariants} key={`trending-${contentItem.tmdb_id}`}>
                      <MovieCard movie={contentItem} compact isTMDB={true} />
                    </motion.div>
                  ))}
                </motion.div>
                {trendingContent.length > 6 && (
                  <div className="mt-6 text-center">
                    <Button variant="outline" onClick={handleToggleTrendingItems} className="group">
                      {trendingItemsToShow === 6 ? 'Ver Mais' : 'Ver Menos'}
                      {trendingItemsToShow === 6 ? <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform" /> : <ChevronUp className="ml-2 h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhum conteúdo em alta no momento.</p>
            )}
          </section>
          
          <section>
            <div className="flex items-center mb-5">
              <Activity className="mr-2.5 h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Feed de Atividades</h2>
            </div>
            {isLoadingFeed ? (
               <div className="space-y-6">
                {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-40 w-full rounded-lg"></div>)}
              </div>
            ) : feedReviews.length > 0 ? (
              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {feedReviews.map(review => (
                  <motion.div variants={itemVariants} key={`feed-${review.id}`}>
                    <ReviewCard review={review} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-2">Seu feed está um pouco quieto.</p>
                <p className="text-sm text-muted-foreground">Siga outros usuários ou explore para ver mais atividades!</p>
                 <Button asChild className="mt-4">
                    <Link to="/explore">Explorar Cineza</Link>
                </Button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default HomePage;
