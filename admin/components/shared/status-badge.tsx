import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  isActive,
  activeText = "Active",
  inactiveText = "Inactive",
  className,
}) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-default transition-all duration-200",
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
        className
      )}
    >
      {isActive ? activeText : inactiveText}
    </Badge>
  );
};

export default StatusBadge;
