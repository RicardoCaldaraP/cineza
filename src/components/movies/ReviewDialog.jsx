
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/movies/StarRating';

const ReviewDialog = ({
  isOpen,
  onOpenChange,
  movieTitle,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  onSubmit,
  isSubmitting,
  isEditing,
  cinezaMovieId
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEditing ? "Editar" : "Nova"} Avaliação para {movieTitle}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="rating-slider" className="text-base">Sua Nota: {rating.toFixed(1)}</Label>
            <StarRating rating={rating} onRatingChange={onRatingChange} editable={true} size={6} className="my-2 justify-center text-3xl" />
            <Slider id="rating-slider" min={0} max={5} step={0.1} value={[rating]} onValueChange={(newVal) => onRatingChange(newVal[0])} />
          </div>
          <div>
            <Label htmlFor="comment-area" className="text-base">Seu Comentário</Label>
            <Textarea 
              id="comment-area" 
              placeholder="O que você achou?" 
              value={comment} 
              onChange={(e) => onCommentChange(e.target.value)} 
              rows={5} 
              className="mt-1 text-base"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={onSubmit} disabled={isSubmitting || rating === 0 || !cinezaMovieId}>
            {isSubmitting ? (isEditing ? "Salvando..." : "Publicando...") : (isEditing ? "Salvar Alterações" : "Publicar Avaliação")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
