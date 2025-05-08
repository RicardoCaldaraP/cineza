
import React from 'react';
import { MessageCircle } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';

const MovieReviewsSection = ({ reviews }) => {
  return (
    <div>
      <div className="flex items-center mb-4">
        <MessageCircle className="mr-2 h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Avaliações ({reviews.length})</h2>
      </div>
      
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Ainda não há avaliações para este filme. Seja o primeiro a avaliar!</p>
        </div>
      )}
    </div>
  );
};

export default MovieReviewsSection;
