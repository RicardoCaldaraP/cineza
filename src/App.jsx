
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/layout/Navbar';
import HomePage from '@/pages/HomePage';
import ExplorePage from '@/pages/ExplorePage';
import WatchlistPage from '@/pages/WatchlistPage';
import MoviePage from '@/pages/MoviePage';
import ProfilePage from '@/pages/ProfilePage';
import EditProfilePage from '@/pages/EditProfilePage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import PostReviewPage from '@/pages/PostReviewPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import NotFoundPage from '@/pages/NotFoundPage';

const AppContent = () => {
  const { currentUser, loading } = useAuth(); 
  const location = useLocation();
  
  const showNavbar = currentUser && location.pathname !== '/login' && location.pathname !== '/signup';

  if (loading && location.pathname !== '/login' && location.pathname !== '/signup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${showNavbar ? 'md:flex-row' : ''}`}>
      {showNavbar && <Navbar />}
      <main className={`flex-1 ${showNavbar ? 'md:ml-20 lg:ml-64' : ''} overflow-y-auto`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />

              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
              <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
              <Route path="/post" element={<ProtectedRoute><PostReviewPage /></ProtectedRoute>} />
              <Route path="/item/:type/:id" element={<ProtectedRoute><MoviePage /></ProtectedRoute>} /> 
              <Route path="/movie/:id" element={<ProtectedRoute><MoviePage /></ProtectedRoute>} />
              <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
