import React from 'react';

export default function TableSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-[#202020] rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-[#333333] animate-pulse">
      <div className="flex bg-gray-50 dark:bg-[#1a1a1a] p-4 border-b border-gray-200 dark:border-[#333333]">
        <div className="h-4 bg-gray-200 dark:bg-[#333333] rounded w-1/4 mr-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-[#333333] rounded w-1/4 mr-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-[#333333] rounded w-1/4 mr-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-[#333333] rounded w-1/4"></div>
      </div>
      
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex p-4 border-b border-gray-100 dark:border-[#2d2d2d] items-center">
          <div className="h-4 bg-gray-100 dark:bg-[#2d2d2d] rounded w-1/4 mr-4"></div>
          <div className="h-4 bg-gray-100 dark:bg-[#2d2d2d] rounded w-1/3 mr-4"></div>
          <div className="h-4 bg-gray-100 dark:bg-[#2d2d2d] rounded w-1/6 mr-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-[#3b3b3b] rounded-full w-1/6"></div>
        </div>
      ))}
    </div>
  );
}
