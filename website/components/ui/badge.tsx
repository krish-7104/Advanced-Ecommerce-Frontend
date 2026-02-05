"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "discount" | "stock" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  const variantClasses = {
    default: "bg-slate-900 text-white",
    discount: "bg-slate-900 text-white",
    stock: "bg-slate-100 text-slate-600",
    outline: "bg-white border border-slate-300 text-slate-700",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function DiscountBadge({ percentage }: { percentage: number }) {
  return <Badge variant="discount">{percentage}% OFF</Badge>;
}

export function OutOfStockBadge() {
  return (
    <Badge variant="stock" className="bg-slate-200 text-slate-600">
      Out of Stock
    </Badge>
  );
}

export function VariantsBadge({ count }: { count: number }) {
  return (
    <Badge variant="outline" size="sm">
      +{count} more options
    </Badge>
  );
}
