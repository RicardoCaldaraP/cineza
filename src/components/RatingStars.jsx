import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const RatingStars = ({ rating, setRating, editable = false, size = "md" }) => {
  const handleSetRating = (value) => {
    if (editable && setRating) {
      setRating(value);
    }
  };

  const starSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const starSize = starSizes[size] || starSizes.md;

  return (
    <div className="rating-stars flex gap-1">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fillPercent =
          Math.min(Math.max(rating - (starIndex - 1), 0), 1) * 100;

        return (
          <motion.button
            key={starIndex}
            type="button"
            onClick={() => handleSetRating(starIndex)}
            whileHover={editable ? { scale: 1.2 } : {}}
            whileTap={editable ? { scale: 0.9 } : {}}
            disabled={!editable}
            className={`relative ${starSize} focus:outline-none ${
              !editable ? "cursor-default" : "cursor-pointer"
            }`}
          >
            {/* Estrela vazia (fundo) */}
            <Star className={`absolute ${starSize} text-muted-foreground`} />

            {/* Estrela preenchida proporcionalmente */}
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star className={`${starSize} text-yellow-400 fill-yellow-400`} />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default RatingStars;
