
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/movies/StarRating';
import MovieSearchPopover from '@/components/reviews/MovieSearchPopover';
import SelectedMovieDisplay from '@/components/reviews/SelectedMovieDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { searchTMDB, ensureMovieInDb, getTMDBMovieDetails } from '@/lib/tmdbService';

const ReviewForm = ({ initialMovieData, initialReviewData }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [cinezaMovieId, setCinezaMovieId] = useState(null);
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const resetFormFields = () => {
    setRating(0);
    setComment('');
    setExistingReview(null);
  };

  const handleSelectMovie = useCallback(async (tmdbMovie) => {
    if (!tmdbMovie || !tmdbMovie.tmdb_id) {
      toast({ title: "Erro", description: "Dados do filme inválidos.", variant: "destructive" });
      return;
    }
  
    let fullTmdbDetails;
    try {
      fullTmdbDetails = await getTMDBMovieDetails(tmdbMovie.tmdb_id, tmdbMovie.media_type);
    } catch (error) {
      toast({ title: "Erro ao buscar detalhes", description: "Não foi possível obter todos os dados do item.", variant: "destructive" });
      setSelectedMovie(tmdbMovie); // Fallback
    }
    setSelectedMovie(fullTmdbDetails || tmdbMovie);
    setSearchQuery('');
    setSearchResults([]);
    setIsPopoverOpen(false);
    setIsSearching(false);
    resetFormFields();
    
    const dbMovie = await ensureMovieInDb(fullTmdbDetails || tmdbMovie);
    if (dbMovie && dbMovie.id) {
      setCinezaMovieId(dbMovie.id);
    } else {
      toast({ title: "Erro", description: "Não foi possível adicionar este item ao nosso banco.", variant: "destructive" });
      setSelectedMovie(null); 
    }
  }, [toast]);


  useEffect(() => {
    if (initialMovieData) {
      handleSelectMovie(initialMovieData);
    }
    if (initialReviewData && initialMovieData) {
      setSelectedMovie(initialMovieData); 
      setCinezaMovieId(initialReviewData.movie_id); 
      setRating(initialReviewData.rating);
      setComment(initialReviewData.comment);
      setExistingReview(initialReviewData);
    }
  }, [initialMovieData, initialReviewData, handleSelectMovie]);


  useEffect(() => {
    const fetchUserReview = async () => {
      if (currentUser && cinezaMovieId && !existingReview) {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('movie_id', cinezaMovieId)
          .eq('user_id', currentUser.id)
          .maybeSingle(); 
        
        if (error) {
            console.error("Error fetching existing review:", error);
            toast({ title: "Erro ao buscar avaliação", description: error.message, variant: "destructive"});
        } else if (data) {
          setRating(data.rating);
          setComment(data.comment);
          setExistingReview(data);
          toast({ title: "Você já avaliou este item.", description: "Editando sua avaliação existente."});
        } else {
          resetFormFields();
        }
      }
    };

    if(!initialReviewData) { // Only fetch if not editing an existing review passed via props
        fetchUserReview();
    }
  }, [currentUser, cinezaMovieId, toast, initialReviewData]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        setIsPopoverOpen(false);
        return;
      }
      setIsSearching(true);
      try {
        const tmdbResults = await searchTMDB(searchQuery.trim());
        setSearchResults(tmdbResults.results || []);
        setIsPopoverOpen((tmdbResults.results || []).length > 0 && searchQuery.trim().length > 1);
      } catch (error) {
        console.error('Error searching TMDB:', error);
        setSearchResults([]);
        setIsPopoverOpen(false);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceSearch = setTimeout(() => { performSearch(); }, 300);
    return () => clearTimeout(debounceSearch);
  }, [searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMovie || !cinezaMovieId) {
      toast({ title: "Erro", description: "Selecione um filme ou série primeiro.", variant: "destructive" });
      return;
    }
    if (rating === 0) {
      toast({ title: "Nota inválida", description: "Por favor, dê uma nota.", variant: "destructive" });
      return;
    }
    if (!currentUser) {
       toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
       return;
    }
    setIsSubmitting(true);

    const reviewData = {
      movie_id: cinezaMovieId, 
      user_id: currentUser.id,
      rating: rating,
      comment: comment.trim(),
    };

    let response;
    if (existingReview) { 
      response = await supabase.from('reviews').update(reviewData).eq('id', existingReview.id).select().single();
    } else { 
      response = await supabase.from('reviews').insert(reviewData).select().single();
    }
    
    const { error } = response;

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Avaliação ${existingReview ? 'atualizada' : 'publicada'}!`, description: `Sua opinião sobre ${selectedMovie.title} foi salva.` });
      navigate(`/item/${selectedMovie.media_type}/${selectedMovie.tmdb_id}`);
    }
    setIsSubmitting(false);
  };

  const handleClearSelection = () => {
    setSelectedMovie(null);
    setCinezaMovieId(null);
    resetFormFields();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="movie-search" className="text-base">Filme ou Série</Label>
        {selectedMovie ? (
          <SelectedMovieDisplay 
            movie={selectedMovie} 
            onClearSelection={handleClearSelection}
            isEditingReview={!!existingReview || !!initialReviewData}
          />
        ) : (
          <MovieSearchPopover
            searchQuery={searchQuery}
            onSearchQueryChange={(e) => setSearchQuery(e.target.value)}
            searchResults={searchResults}
            isSearching={isSearching}
            isPopoverOpen={isPopoverOpen}
            onSelectMovie={handleSelectMovie}
            onOpenChange={(open) => { if(!open && !isSearching && searchResults.length === 0) setIsPopoverOpen(false);}}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-base">Sua Nota: <span className="font-bold text-primary">{rating.toFixed(1)}</span></Label>
        <StarRating rating={rating} onRatingChange={setRating} editable={true} size={6} className="my-2 justify-center text-3xl" />
        <Slider min={0} max={5} step={0.1} value={[rating]} onValueChange={(newVal) => setRating(newVal[0])} disabled={!selectedMovie} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment" className="text-base">Seu Comentário</Label>
        <Textarea id="comment" placeholder={`O que você achou de ${selectedMovie?.title || 'deste item'}? (Opcional)`} value={comment} onChange={(e) => setComment(e.target.value)} rows={5} className="text-base" disabled={!selectedMovie}/>
      </div>

      <Button type="submit" className="w-full text-lg py-6 flex items-center gap-2" disabled={!selectedMovie || !cinezaMovieId || isSubmitting || rating === 0}>
        <Send className="h-5 w-5" />
        {isSubmitting ? (existingReview ? "Salvando..." : "Publicando...") : (existingReview ? "Salvar Alterações" : "Publicar Avaliação")}
      </Button>
    </form>
  );
};

export default ReviewForm;
