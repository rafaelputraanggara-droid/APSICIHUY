import React from "react";
import Link from "next/link";

interface CardProps {
  title: string;
  description: string;
  tag?: string;
  imageUrl?: string;
  ctaText?: string;
  href?: string;
}

export default function Card({
  title,
  description,
  tag,
  imageUrl,
  ctaText = "Read More",
  href = "#",
}: CardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:hover:border-neutral-700/80">
      {/* Optional Image */}
      {imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Tag */}
        {tag && (
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/40 dark:text-indigo-400 dark:ring-indigo-400/20 mb-3">
            {tag}
          </span>
        )}

        <h3 className="text-lg font-semibold leading-6 text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
          {title}
        </h3>
        
        <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 line-clamp-3">
          {description}
        </p>

        {/* CTA Link */}
        <div className="mt-6">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors group/link cursor-pointer"
          >
            {ctaText}
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
