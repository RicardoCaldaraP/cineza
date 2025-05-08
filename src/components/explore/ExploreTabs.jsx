
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film, Tv, Users } from 'lucide-react';

const ExploreTabs = ({ activeTab, onTabChange }) => {
  return (
    <Tabs defaultValue="movies" value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList className="w-full grid grid-cols-3 md:w-auto md:inline-flex">
        <TabsTrigger value="movies" className="flex items-center gap-2 text-sm">
          <Film className="h-4 w-4" />Filmes
        </TabsTrigger>
        <TabsTrigger value="tv" className="flex items-center gap-2 text-sm">
          <Tv className="h-4 w-4" />Séries
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />Usuários
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ExploreTabs;
