
import React from 'react';
import { Search, Tag, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ExploreFilters = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  selectedGenreIds,
  genresForCurrentTab,
  handleGenreToggle,
  setSelectedGenreIds
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input 
          type="text" 
          placeholder="Buscar filmes, séries, usuários..." 
          className="pl-12 pr-4 py-3 text-base rounded-lg search-input focus:ring-primary/50 w-full" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
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
  );
};

export default ExploreFilters;
