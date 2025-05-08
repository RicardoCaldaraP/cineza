
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Film, Users, Tv, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import { getPopularTMDB, searchTMDB, getGenresTMDB } from '@/lib/tmdbService';
import { Button } from '@/components/ui/button';
import ExploreFilters from '@/components/explore/ExploreFilters';
import ExploreResultsGrid from '@/components/explore/ExploreResultsGrid';
import ExploreUserCard from '@/components/explore/ExploreUserCard';
import ExploreSkeletonLoader from '@/components/explore/ExploreSkeletonLoader';


const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('movies'); 
  
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(true); 
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [movieGenres, setMovieGenres] = useState([]);
  const [tvGenres, setTvGenres] = useState([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState([]);
  
  const observer = useRef();
  const debounceTimeoutRef = useRef(null);
  const isInitialLoadDone = useRef(false);

  const lastElementRef = useCallback(node => {
    if (isLoadingMore || !hasMore || isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
        setCurrentPage(prev => prev + 1);
      }
    }, { threshold: 0.5 });
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, isLoading]);

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
  
  const fetchData = useCallback(async (pageToFetch, isSearchOrFilter, currentSearchQuery, currentSelectedGenres, currentActiveTab, isInitialCall = false) => {
    if (pageToFetch === 1 && isInitialCall) setIsLoading(true);
    else if (pageToFetch > 1) setIsLoadingMore(true);
    else if (pageToFetch === 1 && !isInitialCall) setIsLoading(true);


    try {
      let response;
      if (currentActiveTab === 'movies' || currentActiveTab === 'tv') {
        if (isSearchOrFilter) {
          response = await searchTMDB(currentSearchQuery, pageToFetch, currentSelectedGenres, currentActiveTab);
        } else {
          response = await getPopularTMDB(currentActiveTab, pageToFetch, currentSelectedGenres);
        }
        
        const newItems = response.results || [];
        if (currentActiveTab === 'movies') {
          setMovies(prev => pageToFetch === 1 ? newItems : [...prev, ...newItems]);
        } else {
          setTvShows(prev => pageToFetch === 1 ? newItems : [...prev, ...newItems]);
        }
        setHasMore(newItems.length > 0 && response.totalPages > pageToFetch);

      } else if (currentActiveTab === 'users') {
        const itemsPerPage = 12;
        const offset = (pageToFetch - 1) * itemsPerPage;
        let queryBuilder = supabase.from('users').select('id, username, name, avatar_url, bio', { count: 'exact' });

        if (isSearchOrFilter && currentSearchQuery) {
           queryBuilder = queryBuilder.or(`username.ilike.%${currentSearchQuery}%,name.ilike.%${currentSearchQuery}%`);
        }
        
        const { data, error, count } = await queryBuilder.range(offset, offset + itemsPerPage - 1);

        if (error) throw error;
        
        response = { results: data || [], totalPages: data ? Math.ceil(count / itemsPerPage) : 0 };
        
        const newItems = response.results || [];
        setUsers(prev => pageToFetch === 1 ? newItems : [...prev, ...newItems]);
        setHasMore(newItems.length > 0 && response.totalPages > pageToFetch);
      }
    } catch (error) {
      console.error(`Error fetching data for ${currentActiveTab}:`, error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      if (pageToFetch === 1) isInitialLoadDone.current = true;
    }
  }, []);


  useEffect(() => {
    fetchGenres();
    // Initial data fetch is now triggered by the IntersectionObserver
    // or by search/filter/tab changes.
  }, []);
  
  // Effect for search, filter, and tab changes
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      const isSearchingOrFiltering = searchQuery.trim().length >= 2 || selectedGenreIds.length > 0;
      setCurrentPage(1); 
      setMovies([]); 
      setTvShows([]);
      setUsers([]);
      setHasMore(true);
      isInitialLoadDone.current = false; // Reset for new filter/tab
      fetchData(1, isSearchingOrFiltering, searchQuery.trim(), selectedGenreIds, activeTab, true);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedGenreIds, activeTab, fetchData]);

  // Effect for pagination (scrolling or button click)
  useEffect(() => {
    // Only fetch if it's not the initial load AND currentPage > 1
    if (isInitialLoadDone.current && currentPage > 1 && hasMore && !isLoading && !isLoadingMore) {
      const isSearchingOrFiltering = searchQuery.trim().length >= 2 || selectedGenreIds.length > 0;
      fetchData(currentPage, isSearchingOrFiltering, searchQuery.trim(), selectedGenreIds, activeTab);
    }
  }, [currentPage, hasMore, isLoading, isLoadingMore, searchQuery, selectedGenreIds, activeTab, fetchData]);


  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenreIds(prev => 
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    );
  };
  
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } }};
  
  let itemsToDisplay = [];
  if (activeTab === 'movies') itemsToDisplay = movies;
  else if (activeTab === 'tv') itemsToDisplay = tvShows;
  else if (activeTab === 'users') itemsToDisplay = users;

  const genresForCurrentTab = activeTab === 'movies' ? movieGenres : tvGenres;
  const showSkeleton = isLoading && itemsToDisplay.length === 0;
  const showNoResultsMessage = !isLoading && !isLoadingMore && itemsToDisplay.length === 0 && !hasMore; // Show only if truly no more results
  const showLoadMoreButton = hasMore && !isLoadingMore && !isLoading && itemsToDisplay.length > 0;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <motion.h1 className="text-3xl font-bold mb-8 text-foreground" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        Explorar Cineza
      </motion.h1>
      
      <ExploreFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        selectedGenreIds={selectedGenreIds}
        genresForCurrentTab={genresForCurrentTab}
        handleGenreToggle={handleGenreToggle}
        setSelectedGenreIds={setSelectedGenreIds}
      />
      
      <Tabs defaultValue="movies" value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="w-full grid grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="movies" className="flex items-center gap-2 text-sm"><Film className="h-4 w-4" />Filmes</TabsTrigger>
          <TabsTrigger value="tv" className="flex items-center gap-2 text-sm"><Tv className="h-4 w-4" />Séries</TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" />Usuários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="movies" className="mt-6">
          {showSkeleton ? <ExploreSkeletonLoader type="movie" /> : itemsToDisplay.length > 0 ? (
            <ExploreResultsGrid items={itemsToDisplay} type="movie" lastElementRef={lastElementRef} containerVariants={containerVariants} />
          ) : showNoResultsMessage ? (
            <div className="text-center py-12"><Film className="mx-auto h-16 w-16 text-muted-foreground mb-4" /><p className="text-xl text-muted-foreground">Nenhum filme encontrado.</p>{(searchQuery || selectedGenreIds.length > 0) && <p className="text-sm text-muted-foreground">Tente uma busca ou filtro diferente.</p>}</div>
          ): null }
        </TabsContent>
        
        <TabsContent value="tv" className="mt-6">
           {showSkeleton ? <ExploreSkeletonLoader type="tv" /> : itemsToDisplay.length > 0 ? (
            <ExploreResultsGrid items={itemsToDisplay} type="tv" lastElementRef={lastElementRef} containerVariants={containerVariants} />
          ) : showNoResultsMessage ? (
            <div className="text-center py-12"><Tv className="mx-auto h-16 w-16 text-muted-foreground mb-4" /><p className="text-xl text-muted-foreground">Nenhuma série encontrada.</p>{(searchQuery || selectedGenreIds.length > 0) && <p className="text-sm text-muted-foreground">Tente uma busca ou filtro diferente.</p>}</div>
          ): null}
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          {showSkeleton ? <ExploreSkeletonLoader type="user" /> : itemsToDisplay.length > 0 ? (
             <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
              {itemsToDisplay.map((user, index) => (
                <ExploreUserCard key={`explore-user-${user.id}`} user={user} ref={itemsToDisplay.length === index + 1 ? lastElementRef : null} />
              ))}
            </motion.div>
          ) : showNoResultsMessage ? (
             <div className="text-center py-12"><Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" /><p className="text-xl text-muted-foreground">Nenhum usuário encontrado.</p>{searchQuery && <p className="text-sm text-muted-foreground">Tente uma busca diferente.</p>}</div>
          ): null}
        </TabsContent>
      </Tabs>
      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {/* Elemento sentinela para o IntersectionObserver, ele deve ser sempre renderizado */}
      <div ref={lastElementRef} style={{ height: '1px' }} />

      {showLoadMoreButton && (
         itemsToDisplay.length > 0 && /* Somente mostra se já houver itens */
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setCurrentPage(prev => prev + 1)} disabled={isLoadingMore || isLoading}>
            Carregar Mais
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
