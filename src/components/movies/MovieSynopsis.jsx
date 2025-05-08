
import React from 'react';
import { motion } from 'framer-motion';

const MovieSynopsis = ({ description }) => {
  return (
    <motion.div 
      className="lg:col-span-2" 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-2xl font-semibold mb-3 text-foreground">Sinopse</h2>
      <p className="text-foreground/80 leading-relaxed">{description || "Sinopse não disponível."}</p>
    </motion.div>
  );
};

export default MovieSynopsis;
