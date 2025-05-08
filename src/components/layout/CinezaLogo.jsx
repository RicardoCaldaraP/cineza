
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LOGO_URL = "https://storage.googleapis.com/hostinger-horizons-assets-prod/69b9c0e1-f37b-4a24-8fcc-0e531e75a360/e3d84d5eaa1cd7081019fe77301b77da.png";

const CinezaLogo = () => {
  return (
    <Link to="/" className="hidden md:flex items-center gap-2 p-0 lg:p-4 mb-6 justify-center lg:justify-start">
      <motion.div 
        initial={{ scale: 0.8, rotate: -5 }} 
        animate={{ scale: 1, rotate: 0 }} 
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="flex-shrink-0"
      >
        <img src={LOGO_URL} alt="Cineza Logo" className="h-8 w-8" />
      </motion.div>
      <h1 className="text-2xl font-bold text-foreground hidden lg:block">Cineza</h1>
    </Link>
  );
};

export default CinezaLogo;
