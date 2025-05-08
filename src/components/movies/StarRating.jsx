
import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const StarRating = ({ rating, onRatingChange, size = 5, editable = false, className }) => {
  const starArray = Array(5).fill(0);

  const handleStarClick = (index) => {
    if (editable && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const starVariants = {
    hover: { scale: 1.2, transition: { type: 'spring', stiffness: 400, damping: 10 } },
    tap: { scale: 0.9 }
  };

  return (
    <div className={`flex items-center gap-0.5 ${className || ''}`}>
      {starArray.map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        const isHalf = !isFilled && starValue - 0.5 <= rating;

        return (
          <motion.div
            key={index}
            onClick={() => handleStarClick(index)}
            variants={editable ? starVariants : {}}
            whileHover={editable ? "hover" : ""}
            whileTap={editable ? "tap" : ""}
            className={`${editable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`
                ${size === 5 ? 'w-5 h-5' : size === 4 ? 'w-4 h-4' : 'w-6 h-6'}
                ${isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}
              `}
              style={isHalf ? { 
                clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)',
                background: 'linear-gradient(to right, #facc15 50%, var(--muted-foreground-30) 50%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              } : {}}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default StarRating;
