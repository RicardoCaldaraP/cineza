
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import StarRating from '@/components/movies/StarRating'; 
import { Send, Edit3 } from 'lucide-react';

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
  const isSubmitDisabled = rating === 0 || isSubmitting || typeof cinezaMovieId !== 'number';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Avaliação' : 'Sua Avaliação'} para <span className="text-primary">{movieTitle}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing ? 'Modifique sua nota e comentário.' : 'Compartilhe sua opinião com outros usuários.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-base">Sua Nota: <span className="font-bold text-primary">{rating.toFixed(1)}</span></Label>
            <StarRating rating={rating} onRatingChange={onRatingChange} editable={true} size={7} className="my-2 justify-center text-4xl"/>
            <Slider 
              min={0} max={5} step={0.1} 
              value={[rating]} 
              onValueChange={(newVal) => onRatingChange(newVal[0])} 
              className="mt-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base">Seu Comentário (Opcional)</Label>
            <Textarea 
              id="comment" 
              placeholder={`O que você achou de ${movieTitle}?`} 
              value={comment} 
              onChange={(e) => onCommentChange(e.target.value)} 
              rows={5} 
              className="text-base bg-background/50 focus:bg-background"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" onClick={onSubmit} disabled={isSubmitDisabled} className="min-w-[120px]">
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
            ) : (
              isEditing ? <Edit3 className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? (isEditing ? 'Salvando...' : 'Publicando...') : (isEditing ? 'Salvar' : 'Publicar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
