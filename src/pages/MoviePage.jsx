
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import NotFoundPage from '@/pages/NotFoundPage';
import { getTMDBMovieDetails, ensureMovieInDb } from '@/lib/tmdbService';
import MovieHeader from '@/components/movies/MovieHeader';
import MovieSynopsis from '@/components/movies/MovieSynopsis';
import MovieActionsBar from '@/components/movies/MovieActions';
import MovieReviewsSection from '@/components/movies/MovieReviewsSection';
import ReviewDialog from '@/components/movies/ReviewDialog';
import { Separator } from '@/components/ui/separator';
import MovieCast from '@/components/movies/MovieCast';
import MovieRecommendations from '@/components/movies/MovieRecommendations';
import MoviePageLoader from '@/components/movies/MoviePageLoader';
import MoviePosterColumn from '@/components/movies/MoviePosterColumn';
import MovieInfoBar from '@/components/movies/MovieInfoBar';

const MoviePage = () => {
  const { id: tmdbIdParam, type: mediaTypeParam } = useParams();
  const { currentUser, updateUserProfileData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [cinezaMovieId, setCinezaMovieId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(0); 
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [pageError, setPageError] = useState(null);
  
  const mediaType = mediaTypeParam || 'movie';

  const fetchReviews = useCallback(async (internalMovieId) => {
    if (!internalMovieId) return;
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*, users (id, username, name, avatar_url)')
        .eq('movie_id', internalMovieId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        throw reviewsError;
      }
      setReviews(reviewsData || []);
      if (currentUser) {
        const foundUserReview = reviewsData.find(r => r.user_id === currentUser.id);
        setUserReview(foundUserReview || null);
        if (foundUserReview) {
          setRating(foundUserReview.rating);
          setComment(foundUserReview.comment);
        } else {
          setRating(0);
          setComment('');
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error.message);
      toast({ title: "Erro ao buscar avaliações", description: error.message, variant: "destructive" });
    }
  }, [currentUser, toast]);

  const fetchCombinedMovieData = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const currentTmdbId = parseInt(tmdbIdParam, 10);
      if (isNaN(currentTmdbId)) {
        throw new Error("ID do filme/série inválido.");
      }

      const tmdbData = await getTMDBMovieDetails(currentTmdbId, mediaType);
      if (!tmdbData) {
        throw new Error("Filme/Série não encontrado no TMDB.");
      }
      
      const cinezaDbMovie = await ensureMovieInDb(tmdbData);
      if (!cinezaDbMovie || !cinezaDbMovie.id) {
        throw new Error("Não foi possível obter/criar o registro do filme/série no banco de dados local.");
      }
      
      setCinezaMovieId(cinezaDbMovie.id);
      
      setMovie({
        ...tmdbData,
        id: cinezaDbMovie.id, 
        cineza_id: cinezaDbMovie.id,
        average_rating: cinezaDbMovie.average_rating, 
        poster_url: tmdbData.poster_url || cinezaDbMovie.poster_url,
        backdrop_url: tmdbData.backdrop_url || cinezaDbMovie.backdrop_url,
        cast: tmdbData.credits?.cast || [],
        recommendations: tmdbData.recommendations?.results || [],
      });

      await fetchReviews(cinezaDbMovie.id);

    } catch (error) {
      console.error('Error fetching movie page data:', error.message);
      setPageError(error.message);
      setMovie(null);
      toast({ title: "Erro ao carregar página", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [tmdbIdParam, mediaType, toast, fetchReviews]);


  useEffect(() => {
    fetchCombinedMovieData();
  }, [fetchCombinedMovieData]);

  const isInWatchlist = currentUser?.watchlist?.some(item => item === cinezaMovieId);

  const handleToggleWatchlist = async () => {
    if (!currentUser || !cinezaMovieId || !movie) {
      toast({ title: "Ação requer login ou filme inválido", variant: "destructive" });
      return;
    }
    
    let updatedWatchlist;
    if (isInWatchlist) {
      updatedWatchlist = currentUser.watchlist.filter(id => id !== cinezaMovieId);
    } else {
      updatedWatchlist = [...(currentUser.watchlist || []), cinezaMovieId];
    }

    const { error } = await supabase.from('users').update({ watchlist: updatedWatchlist }).eq('id', currentUser.id);
    if (error) toast({ title: "Erro", description: "Não foi possível atualizar a lista.", variant: "destructive" });
    else {
      updateUserProfileData({ watchlist: updatedWatchlist });
      toast({ title: isInWatchlist ? "Removido da lista" : "Adicionado à lista" });
    }
  };

  const handleReviewSubmit = async () => {
    if (!currentUser || !cinezaMovieId) {
      toast({ title: "Ação requer login ou filme inválido", variant: "destructive" }); return;
    }
    if (rating === 0) {
      toast({ title: "Nota inválida", description: "Por favor, selecione uma nota.", variant: "destructive" }); return;
    }
    setIsSubmittingReview(true);
    const reviewPayload = { movie_id: cinezaMovieId, user_id: currentUser.id, rating, comment: comment.trim() };
    
    try {
      const response = editingReview
        ? await supabase.from('reviews').update(reviewPayload).eq('id', editingReview.id).select().single()
        : await supabase.from('reviews').insert(reviewPayload).select().single();
      
      if (response.error) throw response.error;

      toast({ title: `Avaliação ${editingReview ? 'atualizada' : 'publicada'}!` });
      setIsReviewDialogOpen(false);
      setEditingReview(null);
      await fetchReviews(cinezaMovieId); 
      await fetchCombinedMovieData(); // Re-fetch movie data to update average rating potentially
    } catch (error) {
      toast({ title: "Erro ao salvar avaliação", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  const openReviewDialogHandler = () => {
    if (userReview) {
      setEditingReview(userReview);
      setRating(userReview.rating);
      setComment(userReview.comment);
    } else {
      setEditingReview(null);
      setRating(0);
      setComment('');
    }
    setIsReviewDialogOpen(true);
  };

  const handleReviewDeleted = async (deletedReviewId) => {
    setReviews(prevReviews => prevReviews.filter(r => r.id !== deletedReviewId));
    if (userReview && userReview.id === deletedReviewId) {
      setUserReview(null); setRating(0); setComment('');
    }
    await fetchCombinedMovieData(); 
  };

  if (isLoading) return <MoviePageLoader />;
  if (pageError || !movie) return <NotFoundPage message={pageError || "Filme ou Série não encontrado."} />;
  
  return (
    <div className="container max-w-5xl mx-auto px-2 sm:px-4 py-6 pb-24 md:pb-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <MovieHeader movie={movie} reviewsCount={reviews.length} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6 mb-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            <MovieActionsBar
              isInWatchlist={isInWatchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onOpenReviewDialog={openReviewDialogHandler}
              userReviewExists={!!userReview}
              isUserLoggedIn={!!currentUser}
              movieTitle={movie.title}
              reviewCount={reviews.length}
            />
            <MovieInfoBar movie={movie} />
            <MovieSynopsis description={movie.description} />
            {movie.cast && movie.cast.length > 0 && (
              <>
                <Separator className="my-6 bg-border/50" />
                <MovieCast cast={movie.cast} />
              </>
            )}
          </div>
          <MoviePosterColumn posterUrl={movie.poster_url} movieTitle={movie.title} />
        </div>
        
        {movie.recommendations && movie.recommendations.length > 0 && (
          <>
            <Separator className="my-8 bg-border/50" />
            <MovieRecommendations recommendations={movie.recommendations} currentMediaType={movie.media_type} />
          </>
        )}
        
        <Separator className="my-8 bg-border/50" />
        
        <MovieReviewsSection
          reviews={reviews}
          onReviewDeleted={handleReviewDeleted}
          onReviewUpdated={(reviewToEdit) => {
            setEditingReview(reviewToEdit);
            setRating(reviewToEdit.rating);
            setComment(reviewToEdit.comment);
            setIsReviewDialogOpen(true);
          }}
        />
      </motion.div>

      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onOpenChange={(isOpen) => { setIsReviewDialogOpen(isOpen); if (!isOpen) setEditingReview(null); }}
        movieTitle={movie.title}
        rating={rating}
        onRatingChange={setRating}
        comment={comment}
        onCommentChange={setComment}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
        isEditing={!!editingReview}
        cinezaMovieId={cinezaMovieId}
      />
    </div>
  );
};

export default MoviePage;
