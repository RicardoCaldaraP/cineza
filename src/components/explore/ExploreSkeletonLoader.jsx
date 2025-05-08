
import React from 'react';

const ExploreSkeletonLoader = ({ type = 'movie', count = 10 }) => {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8`}>
      {[...Array(count)].map((_, i) => (
        type === 'user' ? (
          <div key={i} className="shimmer p-4 rounded-lg flex flex-col items-center gap-3">
            <div className="shimmer w-20 h-20 rounded-full"></div>
            <div className="shimmer h-5 w-32 rounded mt-2"></div>
            <div className="shimmer h-4 w-24 rounded"></div>
          </div>
        ) : (
          <div key={i} className="shimmer aspect-[2/3] rounded-lg"></div>
        )
      ))}
    </div>
  );
};

export default ExploreSkeletonLoader;
