
import React, { useState } from 'react';
import { Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

// Função simples para renderizar estrelas de exibição (não interativas)
const DisplayStars = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const decimalPart = rating - fullStars;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />);
    } else if (i === fullStars && decimalPart >= 0.25 && decimalPart < 0.75) {
       stars.push(
         <div key={`half-${i}`} className="relative w-4 h-4">
           <Star className="absolute inset-0 w-4 h-4 text-muted-foreground" />
           <Star className="absolute inset-0 w-4 h-4 text-yellow-400 fill-yellow-400" style={{ clipPath: `inset(0 50% 0 0)` }} />
         </div>
       );
    } else if (i === fullStars && decimalPart >= 0.75) {
       stars.push(<Star key={`nearfull-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />);
    } else {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground" />);
    }
  }
  return <div className="flex">{stars}</div>;
};


const MovieDetailsActions = ({ movie, currentUser, userReview, isInWatchlist, onToggleWatchlist, onAddReview }) => {
  const [newRating, setNewRating] = useState([userReview ? userReview.rating : 2.5]);
  const [newComment, setNewComment] = useState(userReview ? userReview.comment : '');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmitReview = () => {
    if (!currentUser) return; // Segurança extra
    
    const reviewData = {
      movieId: movie.id,
      rating: newRating[0],
      comment: newComment.trim() || `Avaliou com ${newRating[0]} estrelas.`
    };
    
    const success = onAddReview(reviewData); // Chama a função passada por prop
    
    if (success) {
      // Limpar e fechar apenas se a adição foi bem-sucedida
      // setNewRating([2.5]); // Não resetar se for edição futura
      // setNewComment('');
      setIsReviewDialogOpen(false);
    }
    // Toasts são tratados na função onAddReview
  };

  // Resetar estado do dialog ao abrir/fechar
  const handleOpenChange = (open) => {
     setIsReviewDialogOpen(open);
     if (open) {
       // Ao abrir, define os valores atuais (ou padrão se não houver review)
       setNewRating([userReview ? userReview.rating : 2.5]);
       setNewComment(userReview ? userReview.comment : '');
     }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Botão Watchlist */}
      <Button 
        onClick={onToggleWatchlist}
        variant={isInWatchlist ? "secondary" : "default"}
        className="w-full flex items-center gap-2"
        disabled={!currentUser}
      >
        <Clock className="h-4 w-4" />
        {isInWatchlist ? "Remover da lista" : "Adicionar à lista"}
      </Button>
      
      {/* Exibição/Botão de Avaliação */}
      {currentUser ? (
        userReview ? (
          // Mostra avaliação existente
          <div className="p-4 border border-border rounded-lg bg-secondary/50">
            <p className="text-sm font-medium mb-2">Sua avaliação</p>
            <div className="flex items-center gap-2">
               <DisplayStars rating={userReview.rating} />
               <span className="text-sm font-bold">({userReview.rating.toFixed(1)})</span>
            </div>
            {/* TODO: Adicionar botão para editar/excluir */}
             <Button 
               variant="link" 
               size="sm" 
               className="mt-2 px-0 h-auto text-xs" 
               onClick={() => setIsReviewDialogOpen(true)} // Abre o dialog para editar
             >
               Editar avaliação
             </Button>
          </div>
        ) : (
          // Botão para adicionar avaliação
          <Dialog open={isReviewDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Star className="h-4 w-4" />
                Avaliar filme
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Avaliar {movie.title}</DialogTitle>
              </DialogHeader>
              {/* Slider */}
               <div className="space-y-2 my-4">
                 <div className="flex justify-between items-center">
                   <Label htmlFor="rating-dialog">Nota</Label>
                   <span className="font-bold text-lg text-primary">{newRating[0].toFixed(1)}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-muted-foreground" />
                    <Slider
                      id="rating-dialog"
                      min={0} max={5} step={0.1}
                      value={newRating}
                      onValueChange={setNewRating}
                      aria-label="Slider de avaliação"
                    />
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                 </div>
               </div>
              {/* Textarea */}
              <Textarea
                placeholder="Escreva um comentário (opcional)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-4"
                rows={3}
              />
              {/* Botão Submit */}
              <Button onClick={handleSubmitReview} className="w-full">
                {userReview ? 'Atualizar avaliação' : 'Publicar avaliação'}
              </Button>
            </DialogContent>
          </Dialog>
        )
      ) : (
        // Mensagem para fazer login
        <p className="text-xs text-center text-muted-foreground">
          Faça login para avaliar e adicionar à lista.
        </p>
      )}
    </div>
  );
};

export default MovieDetailsActions;
