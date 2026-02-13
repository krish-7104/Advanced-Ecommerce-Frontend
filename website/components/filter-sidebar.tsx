"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  categories?: { id: string; name: string; slug: string }[];
  priceRange: [number, number];
  onPriceChange: (value: [number, number]) => void;
  selectedCategories: string[];
  onCategoryToggle: (id: string) => void;
  inStockOnly: boolean;
  onInStockToggle: (value: boolean) => void;
  onClear: () => void;
  className?: string;
}

const FilterContent = ({
  categories = [],
  priceRange,
  onPriceChange,
  selectedCategories,
  onCategoryToggle,
  inStockOnly,
  onInStockToggle,
  onClear,
}: Omit<FilterSidebarProps, "className">) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-slate-900">Filters</h3>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="text-slate-500 hover:text-slate-900 rounded-xl"
      >
        <X className="h-4 w-4 mr-1" />
        Clear
      </Button>
    </div>
    <div>
      <Label className="text-sm font-medium text-slate-700 mb-2 block">
        Price range
      </Label>
      <div className="flex gap-2 mt-2">
        <Input
          type="number"
          placeholder="Min"
          value={priceRange[0] || ""}
          onChange={(e) =>
            onPriceChange([Number(e.target.value) || 0, priceRange[1]])
          }
          className="rounded-xl"
        />
        <Input
          type="number"
          placeholder="Max"
          value={priceRange[1] || ""}
          onChange={(e) =>
            onPriceChange([priceRange[0], Number(e.target.value) || 0])
          }
          className="rounded-xl"
        />
      </div>
    </div>
    {categories.length > 0 && (
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-2 block">
          Category
        </Label>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryToggle(cat.id)}
              className={cn(
                "w-full text-left text-sm px-3 py-2 rounded-xl transition-all duration-200",
                selectedCategories.includes(cat.id)
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    )}
    <div>
      <button
        type="button"
        onClick={() => onInStockToggle(!inStockOnly)}
        className={cn(
          "w-full text-left text-sm px-3 py-2 rounded-xl transition-all duration-200",
          inStockOnly ? "bg-primary text-primary-foreground font-medium" : "text-slate-700 hover:bg-slate-100"
        )}
      >
        In stock only
      </button>
    </div>
  </div>
);

export function FilterSidebar({
  categories,
  priceRange,
  onPriceChange,
  selectedCategories,
  onCategoryToggle,
  inStockOnly,
  onInStockToggle,
  onClear,
  className,
}: FilterSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden rounded-xl border-slate-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 rounded-l-2xl">
          <FilterContent
            categories={categories}
            priceRange={priceRange}
            onPriceChange={onPriceChange}
            selectedCategories={selectedCategories}
            onCategoryToggle={onCategoryToggle}
            inStockOnly={inStockOnly}
            onInStockToggle={onInStockToggle}
            onClear={() => {
              onClear();
              setOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>
      <aside
        className={cn(
          "hidden lg:block w-64 shrink-0 rounded-2xl p-4 h-fit sticky top-24 bg-slate-50/80 shadow-[var(--shadow-card)]",
          className
        )}
      >
        <FilterContent
          categories={categories}
          priceRange={priceRange}
          onPriceChange={onPriceChange}
          selectedCategories={selectedCategories}
          onCategoryToggle={onCategoryToggle}
          inStockOnly={inStockOnly}
          onInStockToggle={onInStockToggle}
          onClear={onClear}
        />
      </aside>
    </>
  );
}
