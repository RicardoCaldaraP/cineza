
import React from 'react';
import { motion } from 'framer-motion';
import ReviewCard from '@/components/movies/ReviewCard';
import { MessageCircle } from 'lucide-react';

const MovieReviewsSection = ({ reviews, onReviewDeleted, onReviewUpdated, currentUserId }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Avaliações ({reviews.length})
      </h2>
      {reviews.length > 0 ? (
        <motion.div 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {reviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              currentUserId={currentUserId}
              onDelete={onReviewDeleted}
              onEdit={onReviewUpdated}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12 bg-card rounded-xl shadow">
          <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Ainda não há avaliações.</p>
          <p className="text-sm text-muted-foreground">Seja o primeiro a compartilhar sua opinião!</p>
        </div>
      )}
    </motion.div>
  );
};

export default MovieReviewsSection;
