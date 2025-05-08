
import React from 'react';

const MoviePageSkeleton = () => {
  return (
    <div className="container max-w-5xl mx-auto px-2 sm:px-4 py-6 pb-24 md:pb-8">
      <div className="shimmer h-72 md:h-96 w-full rounded-xl mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="shimmer h-8 w-3/5 rounded"></div>
          <div className="shimmer h-5 w-full rounded"></div>
          <div className="shimmer h-5 w-full rounded"></div>
          <div className="shimmer h-5 w-4/5 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="shimmer h-12 w-full rounded-lg"></div>
          <div className="shimmer h-12 w-full rounded-lg"></div>
        </div>
      </div>
      <div className="shimmer h-px w-full my-8 bg-border/50"></div>
      <div>
        <div className="shimmer h-8 w-1/3 mb-6 rounded"></div>
        <div className="space-y-6">
          <div className="shimmer h-32 w-full rounded-lg"></div>
          <div className="shimmer h-32 w-full rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default MoviePageSkeleton;
