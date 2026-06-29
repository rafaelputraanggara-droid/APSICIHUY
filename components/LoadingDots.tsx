import React from 'react';

interface LoadingDotsProps {
  text?: string;
  className?: string;
}

export default function LoadingDots({ text = "Memuat data...", className = "" }: LoadingDotsProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 animate-fade-in ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
      </div>
      <p className="text-sm font-medium text-gray-500 animate-pulse">{text}</p>
    </div>
  );
}
