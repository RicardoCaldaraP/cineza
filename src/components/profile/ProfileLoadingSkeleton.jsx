
import React from 'react';

const ProfileLoadingSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-8">
        <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        <div className="flex-1 text-center md:text-left">
          <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>)}
      </div>
    </div>
  );
};

export default ProfileLoadingSkeleton;
