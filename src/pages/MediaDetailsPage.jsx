
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieDetails, getTVShowDetails, getPosterPath, getBackdropPath } from '@/lib/tmdb';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, ListPlus, CheckSquare, Heart, Send, CalendarDays, Clock, Film } from 'lucide-react'; // Adicionado Film aqui
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const RatingInput = ({ rating, setRating, size = 5 }) => (
  <div className="flex items-center">
    {[...Array(size)].map((_, index) => {
      const starValue = index + 1;
      return (
        <button key={starValue} type="button" onClick={() => setRating(starValue)}>
          <Star
            className={`h-6 w-6 cursor-pointer transition-colors ${
              starValue <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300'
            }`}
          />
        </button>
      );
    })}
  </div>
);


const MediaDetailsPage = () => {
  const { mediaType, id } = useParams();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [media, setMedia] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReviewText, setUserReviewText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchMediaData = useCallback(async () => {
    setLoading(true);
    const fetchFunction = mediaType === 'movie' ? getMovieDetails : getTVShowDetails;
    const data = await fetchFunction(id);
    if (data) {
      setMedia({
        ...data,
        title: data.title || data.name,
        release_date: data.release_date || data.first_air_date,
        poster_path: getPosterPath(data.poster_path),
        backdrop_path: getBackdropPath(data.backdrop_path)
      });
    }
    setLoading(false);
  }, [mediaType, id]);

  const fetchReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, user:users(id, username, name, avatar_url)')
      .eq('tmdb_id', id)
      .eq('media_type', mediaType)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching reviews:', error);
    else setReviews(data || []);

    if (currentUser && data) {
      const currentUserReview = data.find(r => r.user_id === currentUser.id);
      if (currentUserReview) {
        setUserReviewText(currentUserReview.comment);
        setUserRating(currentUserReview.rating);
        setExistingReviewId(currentUserReview.id);
      } else {
        setUserReviewText('');
        setUserRating(0);
        setExistingReviewId(null);
      }
    }
  }, [id, mediaType, currentUser]);

  const fetchWatchlistStatus = useCallback(async () => {
    if (!currentUser) return;
    const { data: userProfile } = await supabase
        .from('users')
        .select('watchlist')
        .eq('id', currentUser.id)
        .single();

    if (userProfile?.watchlist) {
        const watchlistItem = userProfile.watchlist.find(item => item.tmdb_id === parseInt(id) && item.media_type === mediaType);
        setIsInWatchlist(!!watchlistItem);
    }
  }, [currentUser, id, mediaType]);


  useEffect(() => {
    fetchMediaData();
    fetchReviews();
    fetchWatchlistStatus();
  }, [fetchMediaData, fetchReviews, fetchWatchlistStatus]);

  const handleReviewSubmit = async () => {
    if (!currentUser || userRating === 0) {
      toast({ title: "Erro", description: "Você precisa estar logado e dar uma nota para avaliar.", variant: "destructive" });
      return;
    }
    setSubmittingReview(true);
    const reviewData = {
      user_id: currentUser.id,
      tmdb_id: parseInt(id),
      media_type: mediaType,
      rating: userRating,
      comment: userReviewText,
      tmdb_metadata: { 
        id: media.id, 
        title: media.title, 
        poster_path: media.poster_path, 
        media_type: mediaType
      }
    };

    let result;
    if (existingReviewId) {
      result = await supabase.from('reviews').update(reviewData).eq('id', existingReviewId).select().single();
    } else {
      result = await supabase.from('reviews').insert(reviewData).select().single();
    }

    if (result.error) {
      toast({ title: "Erro ao salvar avaliação", description: result.error.message, variant: "destructive" });
    } else {
      toast({ title: "Avaliação salva!", description: "Sua avaliação foi registrada com sucesso." });
      if (result.data) {
        setExistingReviewId(result.data.id);
      }
      fetchReviews(); 
    }
    setSubmittingReview(false);
  };
  
  const handleToggleWatchlist = async () => {
    if (!currentUser || !media) return;

    let currentWatchlist = [];
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('watchlist')
        .eq('id', currentUser.id)
        .single();

    if (profileError && profileError.code !== 'PGRST116') { 
        toast({ title: "Erro", description: "Não foi possível buscar sua lista.", variant: "destructive" });
        return;
    }
    currentWatchlist = userProfile?.watchlist || [];

    const watchlistItem = {
      tmdb_id: media.id,
      media_type: mediaType,
      title: media.title,
      poster_path: media.poster_path, 
      vote_average: media.vote_average
    };

    let newWatchlist;
    if (isInWatchlist) {
      newWatchlist = currentWatchlist.filter(item => !(item.tmdb_id === media.id && item.media_type === mediaType));
    } else {
      newWatchlist = [...currentWatchlist, watchlistItem];
    }

    const { error } = await supabase
      .from('users')
      .update({ watchlist: newWatchlist })
      .eq('id', currentUser.id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar sua lista.", variant: "destructive" });
    } else {
      setIsInWatchlist(!isInWatchlist);
      toast({ title: isInWatchlist ? "Removido da Lista" : "Adicionado à Lista", description: `${media.title} foi ${isInWatchlist ? 'removido da' : 'adicionado à'} sua lista.` });
    }
  };


  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Carregando detalhes...</div>;
  if (!media) return <div className="container mx-auto px-4 py-8 text-center">Conteúdo não encontrado.</div>;

  return (
    <div className="pb-16 md:pb-8">
      <div className="relative h-[60vh] md:h-[70vh] w-full">
        {media.backdrop_path && (
          <img  src={media.backdrop_path} alt={`Backdrop de ${media.title}`} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute bottom-0 left-0 right-0 p-4 md:p-8 container mx-auto flex flex-col md:flex-row items-end gap-4 md:gap-8"
        >
          <div className="w-32 h-48 md:w-48 md:h-72 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border-2 border-primary/50">
            {media.poster_path ? (
              <img  src={media.poster_path} alt={media.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground"><Film /></div>
            )}
          </div>
          <div className="py-4">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground drop-shadow-lg">{media.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
              {media.release_date && (
                <span className="flex items-center"><CalendarDays className="h-4 w-4 mr-1" /> {new Date(media.release_date).toLocaleDateString('pt-BR')}</span>
              )}
              {media.runtime && (
                <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {media.runtime} min</span>
              )}
              {media.genres && media.genres.length > 0 && (
                <span>{media.genres.map(g => g.name).join(', ')}</span>
              )}
            </div>
             <div className="flex items-center mt-3 gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" /> 
                <span className="text-xl font-semibold text-foreground">{media.vote_average?.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({media.vote_count} votos no TMDB)</span>
             </div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-3">Sinopse</h2>
            <p className="text-foreground/80 leading-relaxed">{media.overview || "Sinopse não disponível."}</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Ações</h3>
            <Button onClick={handleToggleWatchlist} variant={isInWatchlist ? "secondary" : "default"} className="w-full" disabled={!currentUser}>
              {isInWatchlist ? <CheckSquare className="mr-2 h-4 w-4" /> : <ListPlus className="mr-2 h-4 w-4" />}
              {isInWatchlist ? "Na Minha Lista" : "Adicionar à Lista"}
            </Button>
          </div>
        </div>

        {currentUser && (
          <Card className="mb-12 bg-card/50 border-border/50">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">{existingReviewId ? 'Editar sua avaliação' : 'Deixe sua avaliação'}</h2>
              <div className="mb-4">
                <RatingInput rating={userRating} setRating={setUserRating} />
              </div>
              <Textarea
                value={userReviewText}
                onChange={(e) => setUserReviewText(e.target.value)}
                placeholder={`O que você achou de ${media.title}?`}
                rows={4}
                className="mb-4 bg-input/50"
              />
              <Button onClick={handleReviewSubmit} disabled={submittingReview || userRating === 0}>
                {submittingReview ? 'Enviando...' : (existingReviewId ? 'Atualizar Avaliação' : 'Enviar Avaliação')}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-6">Avaliações da Comunidade ({reviews.length})</h2>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(review => (
                <Card key={review.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Link to={`/profile/${review.user.username}`}>
                        <Avatar>
                          <AvatarImage src={review.user.avatar_url} alt={review.user.name} />
                          <AvatarFallback>{(review.user.name || review.user.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Link to={`/profile/${review.user.username}`}>
                            <p className="font-semibold hover:underline">{review.user.name || review.user.username}</p>
                          </Link>
                          <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center my-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-foreground/80">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Ainda não há avaliações. Seja o primeiro!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaDetailsPage;
