"use client";

import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export function Rating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  reviewCount,
  className,
}: RatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const filled = index < Math.floor(rating);
          const halfFilled = index === Math.floor(rating) && rating % 1 >= 0.5;

          return (
            <Star
              key={index}
              className={cn(
                sizeClasses[size],
                filled || halfFilled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-200"
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span
          className={cn("text-slate-600 font-medium", textSizeClasses[size])}
        >
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={cn("text-slate-400", textSizeClasses[size])}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
