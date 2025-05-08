
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchMedia, formatMediaData } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, X, Film } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const currentQuery = searchParams.get('q');
    if (currentQuery) {
      setQuery(currentQuery);
      performSearch(currentQuery, 1);
    } else {
      setResults([]);
      setTotalPages(0);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery, searchPage) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalPages(0);
      return;
    }
    setLoading(true);
    const data = await searchMedia(searchQuery, searchPage);
    if (data) {
      setResults(prevResults => searchPage === 1 ? data.results.map(formatMediaData) : [...prevResults, ...data.results.map(formatMediaData)]);
      setTotalPages(data.total_pages);
      setPage(searchPage);
    } else {
      setResults(searchPage === 1 ? [] : results);
      setTotalPages(0);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      setPage(1); 
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setTotalPages(0);
    setPage(1);
    navigate('/search');
  };

  const loadMore = () => {
    if (page < totalPages) {
      performSearch(query, page + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar filmes, séries..."
              className="pl-10 pr-10 py-3 text-lg bg-input/50"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={clearSearch}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          <Button type="submit" size="lg" className="py-3 text-lg" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>

        {loading && results.length === 0 && <p className="text-center text-muted-foreground">Carregando resultados...</p>}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <Film className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Nenhum resultado encontrado para "{query}".</p>
            <p className="text-sm text-muted-foreground">Tente uma busca diferente.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {results.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MediaCard item={item} compact />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && results.length > 0 && page < totalPages && (
          <div className="text-center mt-12">
            <Button onClick={loadMore} variant="outline" size="lg">
              Carregar Mais
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SearchPage;
