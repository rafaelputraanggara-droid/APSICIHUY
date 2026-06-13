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
    <div className="group overflow-hidden rounded-2xl border border-[var(--border-panel)] bg-[var(--bg-panel)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Optional Image */}
      {imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-[var(--bg-app)]">
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
          <span className="inline-flex items-center rounded-md bg-[var(--tag-info-bg)] px-2 py-1 text-xs font-medium text-[var(--tag-info-text)] ring-1 ring-inset ring-[var(--border-panel)] mb-3">
            {tag}
          </span>
        )}

        <h3 className="text-lg font-semibold leading-6 text-[var(--text-main)] group-hover:opacity-80 transition-opacity duration-200">
          {title}
        </h3>
        
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)] line-clamp-3">
          {description}
        </p>

        {/* CTA Link */}
        <div className="mt-6">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-main)] hover:opacity-70 transition-opacity group/link cursor-pointer"
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
