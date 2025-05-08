
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Search, Film, Tv } from 'lucide-react';

const MovieSearchPopover = ({ 
  searchQuery, 
  onSearchQueryChange, 
  searchResults, 
  isSearching, 
  isPopoverOpen, 
  onSelectMovie,
  onOpenChange
}) => {
  return (
    <Popover open={isPopoverOpen && searchResults.length > 0 && searchQuery.trim().length > 1} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className="mt-1">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            id="movie-search" 
            type="text" 
            placeholder="Buscar filme ou série..." 
            value={searchQuery} 
            onChange={onSearchQueryChange} 
            className="pl-12 py-3 text-base"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] max-h-72 overflow-y-auto p-0 shadow-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isSearching && <p className="p-4 text-sm text-center text-muted-foreground">Buscando...</p>}
        {!isSearching && searchResults.length > 0 ? (
          <ul className="divide-y divide-border">
            {searchResults.map(item => (
              <li key={`${item.tmdb_id}-${item.media_type}`}>
                <button 
                  type="button" 
                  onClick={() => onSelectMovie(item)} 
                  className="flex items-center gap-3 p-3 w-full text-left hover:bg-secondary/50 transition-colors"
                >
                  <img  
                    alt={item.title ? `Pôster de ${item.title}` : 'Pôster do item da busca'} 
                    className="w-10 h-[60px] object-cover rounded flex-shrink-0"
                    src={item.poster_url || `https://via.placeholder.com/40x60.png/1f2937/FFFFFF?text=${item.title ? encodeURIComponent(item.title[0]) : '?'}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {item.year && <span>{item.year}</span>}
                       {item.year && <span className="mx-0.5">•</span>}
                      {item.media_type === 'tv' ? <Tv className="inline h-3 w-3" /> : <Film className="inline h-3 w-3" />}
                      <span>{item.media_type === 'tv' ? 'Série' : 'Filme'}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !isSearching && searchQuery.trim().length > 1 && <p className="p-4 text-sm text-center text-muted-foreground">Nenhum item encontrado.</p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default MovieSearchPopover;
