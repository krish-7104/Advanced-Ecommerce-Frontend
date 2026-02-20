"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import PageTitle from "@/components/shared/page-title";
import apiHelper from "@/lib/axios-helper";
import { Product } from "@/types/catalog";
import { getPageMetadata } from "@/constants/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type Category = {
  id: string;
  name: string;
};

type AttributeOption = {
  id: string;
  value: string;
};

type Attribute = {
  id: string;
  name: string;
  options: AttributeOption[];
  collapsed?: boolean;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

interface SortableAttributeProps {
  attr: Attribute;
  index: number;
  updateAttributeName: (attrId: string, name: string) => void;
  toggleCollapse: (attrId: string) => void;
  removeAttribute: (attrId: string) => void;
  addOption: (attrId: string) => void;
  updateOption: (attrId: string, optionId: string, value: string) => void;
  removeOption: (attrId: string, optionId: string) => void;
}

const SortableAttribute = ({
  attr,
  index,
  updateAttributeName,
  toggleCollapse,
  removeAttribute,
  addOption,
  updateOption,
  removeOption,
}: SortableAttributeProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: attr.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-lg bg-gray-50 space-y-4 group"
    >
      <div className="flex items-start gap-4">
        <div
          {...attributes}
          {...listeners}
          className="mt-8 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Attribute {index + 1}</label>
          <Input
            placeholder="e.g., Color, Size, Material"
            value={attr.name}
            onChange={(e) => updateAttributeName(attr.id, e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-7"
          onClick={() => toggleCollapse(attr.id)}
        >
          {attr.collapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-7"
          onClick={() => removeAttribute(attr.id)}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>

      {!attr.collapsed && (
        <div className="space-y-3 pl-9">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Options</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addOption(attr.id)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Option
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {attr.options.map((option) => (
              <div key={option.id} className="flex gap-2">
                <Input
                  placeholder="Option value"
                  value={option.value}
                  onChange={(e) =>
                    updateOption(attr.id, option.id, e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addOption(attr.id);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(attr.id, option.id)}
                  disabled={attr.options.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ModifyProduct = () => {
  const params = useSearchParams();
  const productId = params.get("productId") as string | undefined;
  const metadata = getPageMetadata("/products");

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    isActive: true,
    isFeatured: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAttributes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    if (!slugTouched && formData.name) {
      setFormData((prev) => ({ ...prev, slug: slugify(formData.name) }));
    }
  }, [formData.name, slugTouched]);

  const fetchCategories = async () => {
    try {
      const res = await apiHelper.get("/category?level=1");
      if (res.data.statusCode === 200) {
        setCategories(res.data.data);
      }
    } catch {
      toast.dismiss();
      toast.error("Failed to load categories");
    }
  };

  const fetchProduct = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      toast.loading("Fetching product...");
      const res = await apiHelper.get(`/product/${productId}`);

      if (res.data.statusCode === 200) {
        const p = res.data.data;
        setProduct(p);

        setFormData({
          name: p.name,
          slug: p.slug,
          description: p.description || "",
          categoryId: p.categoryId || "",
          isActive: p.isActive,
          isFeatured: p.isFeatured,
        });

        if (p.attributesSchema) {
          let parsedAttrs: Attribute[] = [];

          if (Array.isArray(p.attributesSchema)) {
            // ... existing compatibility ...
            parsedAttrs = p.attributesSchema.map((attr: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              name: attr.name || attr.key,
              options: (attr.options || []).map((v: string) => ({
                id: Math.random().toString(36).substr(2, 9),
                value: v,
              })),
              collapsed: true,
            }));
          } else if (p.attributesSchema["0"] || p.attributesSchema[0]) {
            // ... existing compatibility ...
            parsedAttrs = Object.entries(p.attributesSchema)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([_, attr]: [string, any]) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: attr.key || attr.name || "",
                options: (attr.options || []).map((v: string) => ({
                  id: Math.random().toString(36).substr(2, 9),
                  value: v,
                })),
                collapsed: true,
              }));
          } else {
            // NEW simple format: { "Color": ["Red", "Blue"] }
            parsedAttrs = Object.entries(p.attributesSchema).map(
              ([key, options]) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: key,
                options: (Array.isArray(options) ? options : []).map(
                  (v: string) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    value: v,
                  }),
                ),
                collapsed: true,
              }),
            );
          }
          setAttributes(parsedAttrs);
        }
      }
      toast.dismiss();
    } catch (err: any) {
      toast.dismiss();
      toast.error(err?.response?.data?.message || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [productId]);

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        options: [{ id: Math.random().toString(36).substr(2, 9), value: "" }],
      },
    ]);
  };

  const removeAttribute = (attrId: string) => {
    setAttributes(attributes.filter((a) => a.id !== attrId));
  };

  const updateAttributeName = (attrId: string, name: string) => {
    // Remove spaces from attribute name is NO LONGER REQUIRED/FORCED by logic, but keeping it sanitizes keys
    // Let's allow spaces but maybe trim? User example "Space Gray" is a VALUE. Key "ram" is lowercase.
    // User schema example: "ram", "color".
    // Let's keep existing logic but maybe less aggressive? The existing logic removed spaces.
    // "SanitizedName" - existing logic: name.replace(/\s+/g, "");
    // If I want "Display Size", replacing spaces makes it "DisplaySize".
    // I will leave it as is for keys if that was the convention, or assume user wants keys like "ram", "color".
    // Actually, let's allow flexibility.

    setAttributes(
      attributes.map((a) => (a.id === attrId ? { ...a, name: name } : a)),
    );
  };

  const addOption = (attrId: string) => {
    setAttributes(
      attributes.map((a) =>
        a.id === attrId
          ? {
              ...a,
              options: [
                ...a.options,
                { id: Math.random().toString(36).substr(2, 9), value: "" },
              ],
            }
          : a,
      ),
    );
  };

  const toggleCollapse = (attrId: string) => {
    setAttributes(
      attributes.map((a) =>
        a.id === attrId ? { ...a, collapsed: !a.collapsed } : a,
      ),
    );
  };

  const removeOption = (attrId: string, optionId: string) => {
    setAttributes(
      attributes.map((a) =>
        a.id === attrId
          ? { ...a, options: a.options.filter((o) => o.id !== optionId) }
          : a,
      ),
    );
  };

  const updateOption = (attrId: string, optionId: string, value: string) => {
    setAttributes(
      attributes.map((a) =>
        a.id === attrId
          ? {
              ...a,
              options: a.options.map((o) =>
                o.id === optionId ? { ...o, value } : o,
              ),
            }
          : a,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast.dismiss();
      toast.error("Name and slug are required");
      return;
    }

    try {
      setLoading(true);
      toast.loading(productId ? "Updating product..." : "Creating product...");

      const attributesSchema = attributes
        .filter((attr) => attr.name)
        .reduce(
          (acc, attr) => {
            const validOptions = attr.options
              .map((o) => o.value)
              .filter((v) => v.trim() !== "");

            if (validOptions.length > 0) {
              // New format: key -> values array
              acc[attr.name] = validOptions;
            }
            return acc;
          },
          {} as Record<string, string[]>,
        );

      const payload = {
        ...formData,
        attributesSchema,
      };

      const res = productId
        ? await apiHelper.patch(`/product/${productId}`, payload)
        : await apiHelper.post("/product", payload);

      if ([200, 201].includes(res.data.statusCode)) {
        toast.dismiss();
        toast.success("Saved successfully");
        router.push("/products");
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen bg-white">
      <PageTitle
        title={product ? `Modify Product` : "Add Product"}
        addBackButton
      />

      <div className="container mx-auto my-4">
        <div className="space-y-4">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                placeholder="Product name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug *</label>
              <Input
                placeholder="auto-generated-slug"
                value={formData.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setFormData({ ...formData, slug: e.target.value });
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <div className="prose-sm bg-white rounded-md">
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "clean"],
                  ],
                }}
              />
            </div>
          </div>

          {/* Attributes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Product Attributes</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttribute}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Attribute
              </Button>
            </div>

            {attributes.length === 0 ? (
              <div className="text-sm text-gray-500 p-4 border border-dashed rounded-lg text-center">
                No attributes added yet. Click &quot;Add Attribute&quot; to get
                started.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={attributes.map((a) => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-6">
                    {attributes.map((attr, index) => (
                      <SortableAttribute
                        key={attr.id}
                        attr={attr}
                        index={index}
                        updateAttributeName={updateAttributeName}
                        toggleCollapse={toggleCollapse}
                        removeAttribute={removeAttribute}
                        addOption={addOption}
                        updateOption={updateOption}
                        removeOption={removeOption}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Status Toggles */}
          <div className="flex gap-8 p-4 bg-gray-50 rounded-lg">
            {productId && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium cursor-pointer">
                  Active
                </label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium cursor-pointer">
                Featured
              </label>
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked })
                }
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="button" disabled={loading} onClick={handleSubmit}>
              {productId ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModifyProduct;
