"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
};

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative z-50 w-full max-w-lg bg-white rounded-md shadow-sm p-6 max-h-[90vh] overflow-y-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 mb-4", className)}
      {...props}
    />
  );
};

const DialogTitle = ({ className, ...props }: React.ComponentProps<"h2">) => {
  return (
    <h2
      className={cn("text-lg font-semibold text-slate-900", className)}
      {...props}
    />
  );
};

const DialogDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">) => {
  return (
    <p className={cn("text-sm text-slate-600", className)} {...props} />
  );
};

const DialogFooter = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("flex justify-end gap-2 mt-6", className)}
      {...props}
    />
  );
};

const DialogClose = ({
  onClose,
  className,
  ...props
}: React.ComponentProps<"button"> & { onClose?: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 text-slate-400 hover:text-slate-900",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  );
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
};
