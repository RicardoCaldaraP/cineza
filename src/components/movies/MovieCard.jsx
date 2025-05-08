
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Film, Tv, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { ensureMovieInDb } from '@/lib/tmdbService';

const MovieCard = ({ movie, compact = false, isTMDB = false }) => {
  const { currentUser, updateUserProfileData } = useAuth();
  const { toast } = useToast();
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [localCinezaId, setLocalCinezaId] = useState(movie?.cineza_id || null);
  const [localIsOnWatchlist, setLocalIsOnWatchlist] = useState(false);

  const isMovieObject = movie && typeof movie === 'object' && (movie.id !== undefined || movie.tmdb_id !== undefined);

  useEffect(() => {
    if (!isMovieObject || !currentUser) {
      setLocalIsOnWatchlist(false);
      return;
    }

    let determinedCinezaId = localCinezaId;
    if (!determinedCinezaId && currentUser.watchlist_map && movie.tmdb_id && currentUser.watchlist_map[movie.tmdb_id]?.media_type === movie.media_type) {
      determinedCinezaId = currentUser.watchlist_map[movie.tmdb_id].cineza_id;
      if (determinedCinezaId && !localCinezaId) {
        setLocalCinezaId(determinedCinezaId);
      }
    }
    
    if (determinedCinezaId) {
      setLocalIsOnWatchlist(currentUser.watchlist?.includes(determinedCinezaId) || false);
    } else {
      setLocalIsOnWatchlist(false);
    }

  }, [currentUser, movie, localCinezaId, isMovieObject]);


  if (!isMovieObject || !movie.tmdb_id || !movie.media_type) { 
    console.warn("MovieCard: Dados do filme inválidos ou ausentes.", movie);
    return <div className="shimmer aspect-[2/3] rounded-lg"></div>; 
  }
  
  const tmdbIdForLink = movie.tmdb_id;
  const mediaTypeForLink = movie.media_type;
  const linkTo = `/item/${mediaTypeForLink}/${tmdbIdForLink}`;

  const handleToggleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast({ title: "Ação requer login", description: "Faça login para gerenciar sua lista.", variant: "destructive" });
      return;
    }
    if (!movie.tmdb_id || !movie.media_type) {
        toast({ title: "Erro", description: "Dados do filme incompletos para adicionar à lista.", variant: "destructive" });
        return;
    }

    setIsWatchlistLoading(true);

    try {
      let internalMovieIdToUse = localCinezaId;
      if (!internalMovieIdToUse) {
        const ensuredMovie = await ensureMovieInDb(movie);
        if (!ensuredMovie || !ensuredMovie.id) {
          toast({ title: "Erro", description: "Não foi possível encontrar/salvar dados do filme para a watchlist.", variant: "destructive" });
          setIsWatchlistLoading(false);
          return;
        }
        internalMovieIdToUse = ensuredMovie.id;
        setLocalCinezaId(internalMovieIdToUse); 
      }
      
      const isOnWatchlistCurrently = currentUser?.watchlist?.includes(internalMovieIdToUse);

      let updatedWatchlist;
      if (isOnWatchlistCurrently) {
        updatedWatchlist = currentUser.watchlist.filter(id => id !== internalMovieIdToUse);
      } else {
        updatedWatchlist = [...(currentUser.watchlist || []), internalMovieIdToUse];
      }
      
      const newWatchlistMap = { ...(currentUser.watchlist_map || {}) };
      if (isOnWatchlistCurrently) {
        delete newWatchlistMap[movie.tmdb_id];
      } else {
        newWatchlistMap[movie.tmdb_id] = { cineza_id: internalMovieIdToUse, media_type: movie.media_type };
      }

      const { error } = await supabase
        .from('users')
        .update({ watchlist: updatedWatchlist, watchlist_map: newWatchlistMap })
        .eq('id', currentUser.id);

      if (error) {
        toast({ title: "Erro", description: "Não foi possível atualizar a lista.", variant: "destructive" });
      } else {
        updateUserProfileData({ watchlist: updatedWatchlist, watchlist_map: newWatchlistMap });
        setLocalIsOnWatchlist(!isOnWatchlistCurrently);
        toast({
          title: isOnWatchlistCurrently ? "Removido da lista" : "Adicionado à lista",
          description: `${movie.title} foi ${isOnWatchlistCurrently ? 'removido da' : 'adicionado à'} sua lista.`,
        });
      }
    } catch (error) {
        console.error("Erro ao alternar watchlist:", error);
        toast({ title: "Erro ao atualizar lista", description: error.message, variant: "destructive" });
    } finally {
        setIsWatchlistLoading(false);
    }
  };
  
  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    hover: { scale: 1.03, boxShadow: "0 10px 20px rgba(var(--primary-rgb), 0.1)", transition: { duration: 0.2 } }
  };

  const posterUrl = movie.poster_url; 
  const backdropUrl = movie.backdrop_url || posterUrl;
  
  const cinezaAverageRating = movie.average_rating; 
  const tmdbAverageRating = movie.vote_average_tmdb;
  const displayGenre = movie.genre || 'Gênero Desconhecido';

  if (compact) {
    return (
      <motion.div className="relative group" variants={cardVariants} initial="initial" animate="animate" whileHover="hover">
        <Link to={linkTo} className="block">
          <div className="aspect-[2/3] bg-secondary rounded-lg overflow-hidden shadow-lg">
            {posterUrl ? (
              <img  alt={movie.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={posterUrl} />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Film className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <h3 className="text-white font-semibold text-sm truncate">{movie.title}</h3>
             {(cinezaAverageRating > 0 || tmdbAverageRating > 0) && (
              <div className="flex items-center mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs ml-1">
                  {cinezaAverageRating > 0 ? cinezaAverageRating?.toFixed(1) : tmdbAverageRating?.toFixed(1)}
                </span>
                {cinezaAverageRating > 0 && <span className="text-white/70 text-xs ml-1">(Cineza)</span>}
                {!cinezaAverageRating && tmdbAverageRating > 0 && <span className="text-white/70 text-xs ml-1">(TMDB)</span>}
              </div>
            )}
          </div>
        </Link>
        {currentUser && (
          <Button
            size="icon"
            variant={localIsOnWatchlist ? "default" : "secondary"}
            className="absolute top-2 right-2 z-10 h-8 w-8 opacity-80 group-hover:opacity-100 transition-opacity"
            onClick={handleToggleWatchlist}
            title={localIsOnWatchlist ? "Remover da lista" : "Adicionar à lista"}
            disabled={isWatchlistLoading}
          >
            {isWatchlistLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div className="bg-card rounded-xl overflow-hidden shadow-xl flex flex-col" variants={cardVariants} initial="initial" animate="animate" whileHover="hover">
      <Link to={linkTo} className="block">
        <div className="relative aspect-video bg-secondary">
          {backdropUrl ? (
            <img  alt={movie.title} className="w-full h-full object-cover" src={backdropUrl} />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              {mediaTypeForLink === 'tv' ? <Tv className="w-16 h-16 text-muted-foreground" /> : <Film className="w-16 h-16 text-muted-foreground" />}
            </div>
          )}
           <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-md">
            {mediaTypeForLink === 'tv' ? <Tv className="h-4 w-4 text-white" /> : <Film className="h-4 w-4 text-white" />}
          </div>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={linkTo}>
          <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors">{movie.title}</h3>
        </Link>
        <p className="text-muted-foreground text-xs mb-2">
          {movie.director || movie.creators ? `${movie.director || movie.creators}, ` : ''}
          {movie.year}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-grow mb-3">{movie.description}</p>
        
        <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{displayGenre}</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-foreground">
              {cinezaAverageRating > 0 ? cinezaAverageRating?.toFixed(1) : (tmdbAverageRating > 0 ? tmdbAverageRating?.toFixed(1) : 'N/A')}
            </span>
            {cinezaAverageRating > 0 && <span className="text-muted-foreground text-xs ml-0.5">(Cineza)</span>}
            {!cinezaAverageRating && tmdbAverageRating > 0 && <span className="text-muted-foreground text-xs ml-0.5">(TMDB)</span>}
          </div>
          
          {currentUser && (
            <Button size="sm" variant={localIsOnWatchlist ? "outline" : "secondary"} onClick={handleToggleWatchlist} disabled={isWatchlistLoading}>
              {isWatchlistLoading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Clock className="h-4 w-4 mr-1.5" />}
              {localIsOnWatchlist ? "Na Lista" : "Adicionar"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
