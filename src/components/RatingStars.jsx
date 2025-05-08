
import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const RatingStars = ({ rating, setRating, editable = false, size = 'md' }) => {
  const handleSetRating = (value) => {
    if (editable && setRating) {
      setRating(value);
    }
  };
  
  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const starSize = starSizes[size] || starSizes.md;
  
  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          onClick={() => handleSetRating(star)}
          whileHover={editable ? { scale: 1.2 } : {}}
          whileTap={editable ? { scale: 0.9 } : {}}
          disabled={!editable}
          className={`focus:outline-none ${!editable ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star 
            className={`${starSize} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} 
          />
        </motion.button>
      ))}
    </div>
  );
};

export default RatingStars;
