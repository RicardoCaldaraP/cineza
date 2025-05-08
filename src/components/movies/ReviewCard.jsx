
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, MessageSquare, Edit2, Trash2, Film, Tv, Send, CornerDownRight, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { formatDateTime, generateAvatarFallback } from '@/lib/utils';
import CommentCard from '@/components/movies/CommentCard';

const ReviewCard = ({ review: initialReview, onReviewDeleted, onReviewUpdated }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [review, setReview] = useState(initialReview);
  const [author, setAuthor] = useState(null);
  const [movie, setMovie] = useState(null);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialReview.likes_count || 0);

  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);


  useEffect(() => {
    setReview(initialReview);
    setLikesCount(initialReview.likes_count || 0);
  }, [initialReview]);

  useEffect(() => {
    const fetchAuthorAndMovie = async () => {
      if (!review) return;

      const { data: authorData, error: authorError } = await supabase
        .from('users')
        .select('username, name, avatar_url')
        .eq('id', review.user_id)
        .single();
      if (authorError) console.error('Error fetching review author:', authorError);
      else setAuthor(authorData);

      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .select('id, tmdb_id, media_type, title, year, poster_url, genre, backdrop_url')
        .eq('id', review.movie_id)
        .single();
      if (movieError) console.error('Error fetching review movie:', movieError);
      else setMovie(movieData);
    };

    fetchAuthorAndMovie();
  }, [review]);

  useEffect(() => {
    const checkIfLiked = async () => {
      if (!currentUser || !review) return;
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('review_id', review.id)
        .maybeSingle();
      
      if (error) console.error('Error checking like status:', error);
      else setIsLiked(!!data);
    };
    checkIfLiked();
  }, [currentUser, review]);

  const fetchCommentsCount = useCallback(async () => {
    if (!review) return;
    const { count, error } = await supabase
      .from('review_comments')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', review.id);

    if (error) {
      console.error('Error fetching comments count:', error);
    } else {
      setCommentsCount(count || 0);
    }
  }, [review]);

  useEffect(() => {
    fetchCommentsCount();
  }, [fetchCommentsCount]);


  const fetchComments = useCallback(async () => {
    if (!review) return;
    setIsLoadingComments(true);
    const { data, error } = await supabase
      .from('review_comments')
      .select(`
        *,
        users:user_id (username, name, avatar_url)
      `)
      .eq('review_id', review.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      toast({ title: "Erro ao buscar comentários", variant: "destructive" });
    } else {
      setComments(data || []);
    }
    setIsLoadingComments(false);
  }, [review, toast]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, fetchComments]);

  const handleToggleComments = () => {
    setShowComments(prev => !prev);
  };

  const handleAddComment = async () => {
    if (!currentUser || !review || !newCommentText.trim()) {
      toast({ title: "Escreva algo para comentar.", variant: "destructive" });
      return;
    }
    setIsSubmittingComment(true);
    const { data: newComment, error } = await supabase
      .from('review_comments')
      .insert({
        review_id: review.id,
        user_id: currentUser.id,
        comment_text: newCommentText.trim()
      })
      .select(`*, users:user_id (username, name, avatar_url)`)
      .single();

    if (error) {
      toast({ title: "Erro ao adicionar comentário", description: error.message, variant: "destructive" });
    } else {
      setComments(prevComments => [...prevComments, newComment]);
      setNewCommentText('');
      fetchCommentsCount(); 
      toast({ title: "Comentário adicionado!" });
    }
    setIsSubmittingComment(false);
  };


  const handleLikeToggle = async () => {
    if (!currentUser || !review) {
      toast({ title: "Ação requer login", variant: "destructive" });
      return;
    }
    setIsLoadingLike(true);
    if (isLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('review_id', review.id);
      if (error) {
        toast({ title: "Erro ao descurtir", description: error.message, variant: "destructive" });
      } else {
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: currentUser.id, review_id: review.id });
      if (error) {
        toast({ title: "Erro ao curtir", description: error.message, variant: "destructive" });
      } else {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    }
    setIsLoadingLike(false);
  };
  
  const handleDeleteReview = async () => {
    if (!currentUser || currentUser.id !== review.user_id) return;
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', review.id);

    if (error) {
      toast({ title: "Erro ao excluir avaliação", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Avaliação excluída com sucesso!" });
      if (onReviewDeleted) onReviewDeleted(review.id);
    }
  };

  if (!review || !author || !movie) {
    return <div className="shimmer h-40 w-full rounded-lg"></div>;
  }

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`}
        />
      );
    }
    return stars;
  };
  
  const movieLink = movie.tmdb_id && movie.media_type ? `/item/${movie.media_type}/${movie.tmdb_id}` : `/movie/${movie.id}`;
  const displayPosterUrl = movie.poster_url || movie.backdrop_url;

  return (
    <motion.div
      className="bg-card rounded-xl p-5 shadow-lg border border-border/50"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-3">
        <Link to={`/profile/${author.username}`} className="flex items-center gap-3 group">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatar_url} alt={author.name} />
            <AvatarFallback>{generateAvatarFallback(author.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{author.name}</h3>
            <p className="text-xs text-muted-foreground">@{author.username}</p>
          </div>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          {renderStars(review.rating)}
          <span className="ml-1 font-medium text-foreground">({review.rating.toFixed(1)})</span>
        </div>
      </div>

      <Link to={movieLink} className="block my-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-[72px] rounded overflow-hidden flex-shrink-0 bg-muted">
            {displayPosterUrl ? (
              <img src={displayPosterUrl} alt={movie.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {movie.media_type === 'tv' ? <Tv className="w-6 h-6 text-muted-foreground" /> : <Film className="w-6 h-6 text-muted-foreground" />}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">{movie.title}</h4>
            <p className="text-xs text-muted-foreground">{movie.year} • {movie.genre}</p>
          </div>
        </div>
      </Link>
      
      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
      
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleLikeToggle} disabled={isLoadingLike} className="text-muted-foreground hover:text-primary">
            <Heart className={`w-4 h-4 mr-1.5 ${isLiked ? 'text-primary fill-primary' : ''}`} />
            {likesCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToggleComments} className="text-muted-foreground hover:text-primary">
            <MessageSquare className="w-4 h-4 mr-1.5" />
            {commentsCount}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {currentUser && currentUser.id === review.user_id && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500" onClick={() => onReviewUpdated && onReviewUpdated(review)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDeleteReview}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <span className="text-xs text-muted-foreground">{formatDateTime(review.created_at)}</span>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center">
            <CornerDownRight className="w-4 h-4 mr-2 text-muted-foreground"/> Comentários
          </h4>
          {isLoadingComments ? (
             <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map(comment => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">Nenhum comentário ainda. Seja o primeiro!</p>
          )}
          
          {currentUser && (
            <div className="mt-4 flex items-start gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
                <AvatarFallback>{generateAvatarFallback(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <Textarea
                  placeholder="Adicione um comentário..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="text-sm min-h-[60px]"
                  rows={2}
                />
                <Button 
                  size="sm" 
                  onClick={handleAddComment} 
                  disabled={isSubmittingComment || !newCommentText.trim()}
                  className="mt-2 float-right"
                >
                  {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Send className="w-4 h-4 mr-2" />}
                  Comentar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ReviewCard;
