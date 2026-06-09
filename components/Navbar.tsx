import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="shrink-0">
            <span className="text-xl font-bold">Logo</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                Home
              </Link>
              <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                About
              </Link>
              <Link href="/contact" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}