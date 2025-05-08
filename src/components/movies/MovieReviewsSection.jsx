
import React from 'react';
import ReviewCard from '@/components/movies/ReviewCard';
import { MessageCircle } from 'lucide-react';

const MovieReviewsSection = ({ reviews, onReviewDeleted, onReviewUpdated }) => {
  return (
    <div>
      <div className="flex items-center mb-6">
        <MessageCircle className="mr-3 h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">Avaliações Cineza ({reviews.length})</h2>
      </div>
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onReviewDeleted={onReviewDeleted} 
              onReviewUpdated={onReviewUpdated} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Nenhuma avaliação ainda.</p>
          <p className="text-sm text-muted-foreground">Seja o primeiro a compartilhar sua opinião!</p>
        </div>
      )}
    </div>
  );
};

export default MovieReviewsSection;
