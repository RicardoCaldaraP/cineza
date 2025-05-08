
import React from 'react';
import { Bookmark, MessageSquare, Share2, Check, Edit3, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const MovieActionsBar = ({
  isInWatchlist,
  onToggleWatchlist,
  onOpenReviewDialog,
  userReviewExists,
  isUserLoggedIn,
  movieTitle,
  reviewCount
}) => {
  const { toast } = useToast();

  const handleShare = () => {
    if (navigator.share && movieTitle) {
      navigator.share({
        title: movieTitle,
        text: `Confira ${movieTitle} no Cineza!`,
        url: window.location.href,
      })
      .then(() => toast({ title: "Compartilhado!", description: `${movieTitle} compartilhado com sucesso.` }))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copiado!", description: "Link da página copiado para a área de transferência." });
    }
  };

  return (
    <div className="bg-card p-3 sm:p-4 rounded-xl shadow-md border border-border/50">
      <div className="flex flex-wrap items-center justify-around gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleWatchlist} 
          disabled={!isUserLoggedIn}
          className="flex-1 min-w-[120px] text-xs sm:text-sm"
        >
          {isInWatchlist ? <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 text-primary" /> : <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" />}
          {isInWatchlist ? 'Na Lista' : 'Salvar na Lista'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onOpenReviewDialog} 
          disabled={!isUserLoggedIn}
          className="flex-1 min-w-[120px] text-xs sm:text-sm"
        >
          {userReviewExists ? <Edit3 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" /> : <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" />}
          {userReviewExists ? 'Editar Avaliação' : 'Avaliar'} ({reviewCount})
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="flex-1 min-w-[120px] text-xs sm:text-sm"
        >
          <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" />
          Compartilhar
        </Button>
      </div>
    </div>
  );
};

export default MovieActionsBar;
