
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Film, Users, Tv, Tag, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MovieCard from '@/components/movies/MovieCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { generateAvatarFallback } from '@/lib/utils';
import { getPopularTMDB, searchTMDB, getGenresTMDB } from '@/lib/tmdbService';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('movies');

  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [discoveredUsers, setDiscoveredUsers] = useState([]);

  const [searchResultsMovies, setSearchResultsMovies] = useState([]);
  const [searchResultsTV, setSearchResultsTV] = useState([]);
  const [searchResultsUsers, setSearchResultsUsers] = useState([]);

  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingTV, setIsLoadingTV] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [currentPageMovies, setCurrentPageMovies] = useState(1);
  const [currentPageTV, setCurrentPageTV] = useState(1);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [hasMoreTV, setHasMoreTV] = useState(true);

  const [movieGenres, setMovieGenres] = useState([]);
  const [tvGenres, setTvGenres] = useState([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState([]);

  const observer = useRef();

  const lastMovieElementRef = useCallback(node => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (activeTab === 'movies' && hasMoreMovies) {
          loadMoreItems('movies');
        } else if (activeTab === 'tv' && hasMoreTV) {
          loadMoreItems('tv');
        }
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMoreMovies, hasMoreTV, activeTab]);


  const fetchGenres = async () => {
    try {
      const [mg, tg] = await Promise.all([
        getGenresTMDB('movie'),
        getGenresTMDB('tv')
      ]);
      setMovieGenres(mg || []);
      setTvGenres(tg || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const resetAndFetchInitial = (tab, genres = []) => {
    if (tab === 'movies') {
      setPopularMovies([]);
      setCurrentPageMovies(1);
      setHasMoreMovies(true);
      fetchInitialData(tab, 1, genres);
    } else if (tab === 'tv') {
      setPopularTVShows([]);
      setCurrentPageTV(1);
      setHasMoreTV(true);
      fetchInitialData(tab, 1, genres);
    } else if (tab === 'users') {
      setDiscoveredUsers([]);
      fetchInitialData(tab, 1);
    }
  }

  const fetchInitialData = useCallback(async (currentTab, page = 1, genresToFilter = []) => {
    if (currentTab === 'movies') setIsLoadingMovies(true);
    if (currentTab === 'tv') setIsLoadingTV(true);
    if (currentTab === 'users') setIsLoadingUsers(true);

    try {
      if (currentTab === 'movies') {
        const moviesRes = await getPopularTMDB('movie', page, genresToFilter);
        setPopularMovies(prev => page === 1 ? moviesRes.results : [...prev, ...moviesRes.results]);
        setHasMoreMovies(moviesRes.results.length > 0 && moviesRes.totalPages > page);
        setCurrentPageMovies(page);
      } else if (currentTab === 'tv') {
        const tvRes = await getPopularTMDB('tv', page, genresToFilter);
        setPopularTVShows(prev => page === 1 ? tvRes.results : [...prev, ...tvRes.results]);
        setHasMoreTV(tvRes.results.length > 0 && tvRes.totalPages > page);
        setCurrentPageTV(page);
      } else if (currentTab === 'users') {
        const usersRes = await supabase.from('users').select('id, username, name, avatar_url, bio').limit(12 * page).range((page - 1) * 12, page * 12 - 1);
        setDiscoveredUsers(prev => page === 1 ? usersRes.data : [...prev, ...(usersRes.data || [])]);
      }
    } catch (error) {
      console.error(`Error fetching initial ${currentTab} data for page ${page}:`, error);
    } finally {
      if (currentTab === 'movies') setIsLoadingMovies(false);
      if (currentTab === 'tv') setIsLoadingTV(false);
      if (currentTab === 'users') setIsLoadingUsers(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchGenres();
    resetAndFetchInitial('movies', selectedGenreIds);
    resetAndFetchInitial('tv', selectedGenreIds);
    resetAndFetchInitial('users');
  }, [selectedGenreIds]);


  const performSearch = useCallback(async (page = 1) => {
    const isSearching = searchQuery.trim().length >= 2;
    const isFiltering = selectedGenreIds.length > 0;

    if (!isSearching && !isFiltering) {
      setSearchResultsMovies([]);
      setSearchResultsTV([]);
      setSearchResultsUsers([]);
      setIsLoadingSearch(false);
      // Reset to popular if search is cleared and no genres selected
      if (page === 1) {
        resetAndFetchInitial(activeTab, selectedGenreIds);
      }
      return;
    }

    if (page === 1) setIsLoadingSearch(true); else setIsLoadingMore(true);

    try {
      if (activeTab === 'movies' || activeTab === 'tv') {
        let results, totalPages;
        if (isSearching) {
          const tmdbRes = await searchTMDB(searchQuery.trim(), page);
          results = tmdbRes.results; // <- Removido o filtro que estava bugando
          totalPages = tmdbRes.totalPages;
        }
        else { // Filtering by genre, no search query
          const popularRes = await getPopularTMDB(activeTab, page, selectedGenreIds);
          results = popularRes.results;
          totalPages = popularRes.totalPages;
        }

        if (selectedGenreIds.length > 0 && isSearching) { // Client-side filter if searching AND genre filtering
          results = results.filter(item => selectedGenreIds.every(gid => item.genre_ids.includes(gid)));
        }

        if (activeTab === 'movies') {
          setSearchResultsMovies(prev => page === 1 ? results : [...prev, ...results]);
          setHasMoreMovies(results.length > 0 && totalPages > page);
          setCurrentPageMovies(page);
        } else {
          setSearchResultsTV(prev => page === 1 ? results : [...prev, ...results]);
          setHasMoreTV(results.length > 0 && totalPages > page);
          setCurrentPageTV(page);
        }
      }

      if (activeTab === 'users' && isSearching) {
        const usersRes = await supabase.from('users').select('id, username, name, avatar_url, bio').or(`username.ilike.%${searchQuery.trim()}%,name.ilike.%${searchQuery.trim()}%`).limit(12).range((page - 1) * 12, page * 12 - 1);
        setSearchResultsUsers(prev => page === 1 ? usersRes.data : [...prev, ...(usersRes.data || [])]);
      } else if (activeTab === 'users' && !isSearching) {
        setSearchResultsUsers([]);
      }

    } catch (error) {
      console.error("Error during explore search/filter:", error);
    } finally {
      if (page === 1) setIsLoadingSearch(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, activeTab, selectedGenreIds]);

  useEffect(() => {
    const isSearchingOrFiltering = searchQuery.trim().length >= 2 || selectedGenreIds.length > 0;
    if (isSearchingOrFiltering) {
      const debounceSearch = setTimeout(() => {
        if (activeTab === 'movies') setCurrentPageMovies(1);
        if (activeTab === 'tv') setCurrentPageTV(1);
        performSearch(1);
      }, 300);
      return () => clearTimeout(debounceSearch);
    } else {
      // Reset to popular if search/filter cleared
      resetAndFetchInitial(activeTab, selectedGenreIds);
    }
  }, [searchQuery, selectedGenreIds, activeTab]);


  const loadMoreItems = (tab) => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    const isSearchingOrFiltering = searchQuery.trim().length >= 2 || selectedGenreIds.length > 0;

    if (tab === 'movies') {
      const nextPage = currentPageMovies + 1;
      if (isSearchingOrFiltering) {
        performSearch(nextPage);
      } else {
        fetchInitialData('movies', nextPage, selectedGenreIds);
      }
    } else if (tab === 'tv') {
      const nextPage = currentPageTV + 1;
      if (isSearchingOrFiltering) {
        performSearch(nextPage);
      } else {
        fetchInitialData('tv', nextPage, selectedGenreIds);
      }
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Reset pagination and data for the new tab
    const isSearchingOrFiltering = searchQuery.trim().length >= 2 || selectedGenreIds.length > 0;
    if (isSearchingOrFiltering) {
      if (newTab === 'movies') { setSearchResultsMovies([]); setCurrentPageMovies(1); setHasMoreMovies(true); }
      if (newTab === 'tv') { setSearchResultsTV([]); setCurrentPageTV(1); setHasMoreTV(true); }
      if (newTab === 'users') { setSearchResultsUsers([]); }
      performSearch(1); // Fetch search results for the new tab
    } else {
      resetAndFetchInitial(newTab, selectedGenreIds); // Fetch popular for the new tab
    }
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenreIds(prev =>
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    );
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const renderSkeletons = (count = 6, type = 'movie') => (
    <div className={`grid grid-cols-1 ${type === 'user' ? 'sm:grid-cols-2 md:grid-cols-3' : 'sm:grid-cols-2 md:grid-cols-3'} gap-6`}>
      {[...Array(count)].map((_, i) => (
        type === 'user' ? (
          <div key={i} className="shimmer p-4 rounded-lg flex flex-col items-center gap-3">
            <div className="shimmer w-20 h-20 rounded-full"></div>
            <div className="shimmer h-5 w-32 rounded mt-2"></div>
            <div className="shimmer h-4 w-24 rounded"></div>
          </div>
        ) : (
          <div key={i} className="shimmer aspect-[2/3] rounded-lg"></div>
        )
      ))}
    </div>
  );

  const isSearchingOrFiltering = searchQuery.trim().length >= 2 || selectedGenreIds.length > 0;
  const moviesToDisplay = isSearchingOrFiltering ? searchResultsMovies : popularMovies;
  const tvToDisplay = isSearchingOrFiltering ? searchResultsTV : popularTVShows;
  const usersToDisplay = searchQuery.trim().length >= 2 ? searchResultsUsers : discoveredUsers;

  let currentInitialLoadingState = false;
  if (activeTab === 'movies') currentInitialLoadingState = isLoadingMovies && moviesToDisplay.length === 0;
  else if (activeTab === 'tv') currentInitialLoadingState = isLoadingTV && tvToDisplay.length === 0;
  else if (activeTab === 'users') currentInitialLoadingState = isLoadingUsers && usersToDisplay.length === 0;

  const showLoadMoreButton = (activeTab === 'movies' && hasMoreMovies && moviesToDisplay.length > 0 && !isLoadingMore) || (activeTab === 'tv' && hasMoreTV && tvToDisplay.length > 0 && !isLoadingMore);

  const genresForCurrentTab = activeTab === 'movies' ? movieGenres : tvGenres;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <motion.h1 className="text-3xl font-bold mb-8 text-foreground" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        Explorar Cineza
      </motion.h1>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input type="text" placeholder="Buscar filmes, séries, usuários..." className="pl-12 pr-4 py-3 text-base rounded-lg search-input focus:ring-primary/50 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        {(activeTab === 'movies' || activeTab === 'tv') && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto justify-center">
                  <Tag className="h-4 w-4" />
                  Filtrar Gêneros
                  {selectedGenreIds.length > 0 && <span className="ml-1.5 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">{selectedGenreIds.length}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 max-h-80 overflow-y-auto p-0">
                <div className="p-4">
                  <h4 className="font-medium text-sm mb-2">Selecionar Gêneros</h4>
                  {genresForCurrentTab.length > 0 ? (
                    <div className="space-y-1">
                      {genresForCurrentTab.map(genre => (
                        <Button
                          key={genre.id}
                          variant={selectedGenreIds.includes(genre.id) ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => handleGenreToggle(genre.id)}
                        >
                          {genre.name}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Carregando gêneros...</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {selectedGenreIds.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedGenreIds([])} className="text-xs text-muted-foreground whitespace-nowrap">
                <X className="h-3 w-3 mr-1" /> Limpar
              </Button>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="movies" value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="w-full grid grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="movies" className="flex items-center gap-2 text-sm"><Film className="h-4 w-4" />Filmes</TabsTrigger>
          <TabsTrigger value="tv" className="flex items-center gap-2 text-sm"><Tv className="h-4 w-4" />Séries</TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" />Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="movies" className="mt-6">
          {(isLoadingSearch || currentInitialLoadingState) ? renderSkeletons(6, 'movie') : moviesToDisplay.length > 0 ? (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8" variants={containerVariants} initial="hidden" animate="visible">
              {moviesToDisplay.map((movie, index) => {
                if (moviesToDisplay.length === index + 1 && (hasMoreMovies || (isSearchingOrFiltering && hasMoreMovies))) {
                  return <motion.div ref={lastMovieElementRef} variants={itemVariants} key={`explore-movie-${movie.tmdb_id || movie.id}`}><MovieCard movie={movie} isTMDB={true} compact /></motion.div>;
                }
                return <motion.div variants={itemVariants} key={`explore-movie-${movie.tmdb_id || movie.id}`}><MovieCard movie={movie} isTMDB={true} compact /></motion.div>;
              })}
            </motion.div>
          ) : (
            <div className="text-center py-12"><Film className="mx-auto h-16 w-16 text-muted-foreground mb-4" /><p className="text-xl text-muted-foreground">Nenhum filme encontrado.</p>{(searchQuery || selectedGenreIds.length > 0) && <p className="text-sm text-muted-foreground">Tente uma busca ou filtro diferente.</p>}</div>
          )}
        </TabsContent>

        <TabsContent value="tv" className="mt-6">
          {(isLoadingSearch || currentInitialLoadingState) ? renderSkeletons(6, 'tv') : tvToDisplay.length > 0 ? (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8" variants={containerVariants} initial="hidden" animate="visible">
              {tvToDisplay.map((tvShow, index) => {
                if (tvToDisplay.length === index + 1 && (hasMoreTV || (isSearchingOrFiltering && hasMoreTV))) {
                  return <motion.div ref={lastMovieElementRef} variants={itemVariants} key={`explore-tv-${tvShow.tmdb_id || tvShow.id}`}><MovieCard movie={tvShow} isTMDB={true} compact /></motion.div>;
                }
                return <motion.div variants={itemVariants} key={`explore-tv-${tvShow.tmdb_id || tvShow.id}`}><MovieCard movie={tvShow} isTMDB={true} compact /></motion.div>;
              })}
            </motion.div>
          ) : (
            <div className="text-center py-12"><Tv className="mx-auto h-16 w-16 text-muted-foreground mb-4" /><p className="text-xl text-muted-foreground">Nenhuma série encontrada.</p>{(searchQuery || selectedGenreIds.length > 0) && <p className="text-sm text-muted-foreground">Tente uma busca ou filtro diferente.</p>}</div>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          {(isLoadingSearch || currentInitialLoadingState) ? renderSkeletons(6, 'user') : usersToDisplay.length > 0 ? (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
              {usersToDisplay.map(user => (
                <motion.div variants={itemVariants} key={`explore-user-${user.id}`}>
                  <Link to={`/profile/${user.username}`} className="block p-5 bg-card hover:bg-secondary rounded-xl transition-colors shadow-lg">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-20 h-20 mb-3 border-2 border-primary/50">
                        <AvatarImage src={user.avatar_url} alt={user.name} />
                        <AvatarFallback>{generateAvatarFallback(user.name || user.username)}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-lg text-foreground truncate w-full">{user.name || user.username}</p>
                      <p className="text-sm text-muted-foreground truncate w-full">@{user.username}</p>
                      {user.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12"><Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" /><p className="text-xl text-muted-foreground">Nenhum usuário encontrado.</p>{searchQuery && <p className="text-sm text-muted-foreground">Tente uma busca diferente.</p>}</div>
          )}
        </TabsContent>
      </Tabs>
      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {!isLoadingMore && !isLoadingSearch && showLoadMoreButton && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => loadMoreItems(activeTab)} disabled={isLoadingMore}>
            Carregar Mais
            {isLoadingMore && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
