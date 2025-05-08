
import React from 'react';

const MoviePageLoader = () => (
  <div className="container max-w-5xl mx-auto px-2 sm:px-4 py-6">
    <div className="shimmer h-72 md:h-96 w-full rounded-xl mb-8"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="shimmer h-8 w-3/4 rounded"></div>
        <div className="shimmer h-24 w-full rounded"></div>
        <div className="shimmer h-10 w-full rounded"></div>
        <div className="shimmer h-6 w-1/2 rounded"></div>
      </div>
      <div className="lg:col-span-1 row-start-1 lg:row-start-auto">
        <div className="shimmer h-[450px] w-full rounded-lg"></div>
      </div>
    </div>
    <div className="shimmer h-6 w-1/3 mb-4 rounded"></div>
    <div className="space-y-4">
      <div className="shimmer h-32 w-full rounded-lg"></div>
      <div className="shimmer h-32 w-full rounded-lg"></div>
    </div>
  </div>
);

export default MoviePageLoader;
