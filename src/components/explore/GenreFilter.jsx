
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Tag, X } from 'lucide-react';

const GenreFilter = ({ genres, selectedGenreIds, onGenreToggle, onClearGenres }) => {
  if (!genres || genres.length === 0) {
    return (
      <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto justify-center" disabled>
        <Tag className="h-4 w-4" />
        Gêneros (Carregando...)
      </Button>
    );
  }

  return (
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
            <div className="space-y-1">
              {genres.map(genre => (
                <Button
                  key={genre.id}
                  variant={selectedGenreIds.includes(genre.id) ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => onGenreToggle(genre.id)}
                >
                  {genre.name}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {selectedGenreIds.length > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearGenres} className="text-xs text-muted-foreground whitespace-nowrap">
          <X className="h-3 w-3 mr-1" /> Limpar
        </Button>
      )}
    </div>
  );
};

export default GenreFilter;
