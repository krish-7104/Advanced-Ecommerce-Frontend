"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: "top" | "bottom" | "left" | "right";
  }
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-white shadow-sm transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out",
        side === "right" &&
          "inset-y-0 right-0 w-full max-w-md border-l border-slate-100 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
        side === "left" &&
          "inset-y-0 left-0 w-full max-w-md border-r border-slate-100 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
        side === "top" &&
          "inset-x-0 top-0 h-auto border-b border-slate-100 data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
        side === "bottom" &&
          "inset-x-0 bottom-0 h-auto border-t border-slate-100 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <SheetPrimitive.Title className="text-sm font-semibold text-slate-900" />
        <SheetClose className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
          <X className="h-4 w-4" />
        </SheetClose>
      </div>
      <div className="h-full overflow-y-auto">{children}</div>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 px-4 pt-4 pb-3 text-left",
      className
    )}
    {...props}
  />
);

const SheetTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn("text-base font-semibold text-slate-900", className)}
    {...props}
  />
);

const SheetDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
);

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};

